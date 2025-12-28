import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({}); // { categoryId: [subcategories] }
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null); // { id, name }
    const [newSubcategory, setNewSubcategory] = useState({ categoryId: '', name: '' });
    const [editingSubcategory, setEditingSubcategory] = useState(null); // { id, name, categoryId }
    const [expandedCategory, setExpandedCategory] = useState(null); // Track which category is expanded

    const [isEditing, setIsEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const [productForm, setProductForm] = useState({
        productName: '',
        description: '',
        price: '',
        quantityInStock: '',
        categoryId: '',
        subcategoryId: ''
    });
    const [productImages, setProductImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStoreData();
    }, []);

    const fetchStoreData = async () => {
        try {
            const storeRes = await api.get(`/store/my-store?ownerId=${user.userId}`);
            setStore(storeRes.data);
            const storeId = storeRes.data.storeId;
            const [catRes, prodRes] = await Promise.all([
                api.get(`/store/categories?storeId=${storeId}`),
                api.get(`/store/products?storeId=${storeId}`)
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data);

            // Fetch subcategories for each category
            const subcatData = {};
            for (const cat of catRes.data) {
                try {
                    const subcatRes = await api.get(`/store/categories/${cat.categoryId}/subcategories`);
                    subcatData[cat.categoryId] = subcatRes.data;
                } catch (error) {
                    console.error(`Failed to fetch subcategories for category ${cat.categoryId}`, error);
                    subcatData[cat.categoryId] = [];
                }
            }
            setSubcategories(subcatData);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Category Logic ---
    const handleAddCategory = async () => {
        if (!newCategory) return;
        try {
            await api.post(`/store/categories?storeId=${store.storeId}`, { categoryName: newCategory });
            toast.success('Category Added');
            setNewCategory('');
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to add category');
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.name) return;
        try {
            await api.put(`/store/categories/${editingCategory.id}`, { categoryName: editingCategory.name });
            toast.success('Category Updated');
            setEditingCategory(null);
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Delete this category? All associated subcategories and products will be affected.')) return;
        try {
            await api.delete(`/store/categories/${categoryId}`);
            toast.success('Category Deleted');
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    // --- Subcategory Logic ---
    const handleAddSubcategory = async () => {
        if (!newSubcategory.categoryId || !newSubcategory.name) {
            toast.error('Please select a category and enter subcategory name');
            return;
        }
        try {
            await api.post(`/store/categories/${newSubcategory.categoryId}/subcategories`, { subcategoryName: newSubcategory.name });
            toast.success('Subcategory Added');
            setNewSubcategory({ categoryId: '', name: '' });
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to add subcategory');
        }
    };

    const handleUpdateSubcategory = async () => {
        if (!editingSubcategory || !editingSubcategory.name) return;
        try {
            await api.put(`/store/subcategories/${editingSubcategory.id}`, { subcategoryName: editingSubcategory.name });
            toast.success('Subcategory Updated');
            setEditingSubcategory(null);
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to update subcategory');
        }
    };

    const handleDeleteSubcategory = async (subcategoryId) => {
        if (!window.confirm('Delete this subcategory?')) return;
        try {
            await api.delete(`/store/subcategories/${subcategoryId}`);
            toast.success('Subcategory Deleted');
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to delete subcategory');
        }
    };

    // --- Category Section Assignment ---
    const handleAssignSection = async (categoryId, section) => {
        try {
            await api.put(`/store/categories/${categoryId}/section`, { section });
            toast.success('Category assigned to section');
            fetchStoreData();
        } catch (error) {
            toast.error('Failed to assign section');
        }
    };

    // --- Product Logic ---
    const handleFileChange = (e) => {
        setProductImages(e.target.files);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('productName', productForm.productName);
        data.append('description', productForm.description);
        data.append('price', productForm.price);
        data.append('quantityInStock', productForm.quantityInStock);
        if (productImages && productImages.length > 0) {
            for (let i = 0; i < productImages.length; i++) {
                data.append('images', productImages[i]);
            }
        }

        try {
            const subcategoryParam = productForm.subcategoryId ? `&subcategoryId=${productForm.subcategoryId}` : '';
            if (isEditing) {
                await api.put(`/store/products/${editingProductId}?storeId=${store.storeId}&categoryId=${productForm.categoryId}${subcategoryParam}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product Updated');
                setIsEditing(false);
                setEditingProductId(null);
            } else {
                await api.post(`/store/products?storeId=${store.storeId}&categoryId=${productForm.categoryId}${subcategoryParam}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product Added');
            }
            setProductForm({ productName: '', description: '', price: '', quantityInStock: '', categoryId: '', subcategoryId: '' });
            setProductImages([]);
            fetchStoreData();
        } catch (error) {
            toast.error('Operation Failed');
        }
    };

    const handleEditClick = (p) => {
        setIsEditing(true);
        setEditingProductId(p.productId);
        setProductForm({
            productName: p.productName,
            description: p.description || '',
            price: p.price,
            quantityInStock: p.quantityInStock,
            categoryId: p.category?.categoryId || '',
            subcategoryId: p.subcategory?.subcategoryId || ''
        });

        // Scroll to product form section smoothly
        setTimeout(() => {
            const formElement = document.getElementById('product-form-section');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight animation
                formElement.style.animation = 'highlight-pulse 1.5s ease-in-out';
                setTimeout(() => {
                    formElement.style.animation = '';
                }, 1500);
            }
        }, 100);

        toast('Edit Mode Active', { icon: '✏️' });
    };

    const handleAddSimilar = (p) => {
        setProductForm({
            productName: p.productName,
            description: p.description || '',
            price: p.price,
            quantityInStock: p.quantityInStock,
            categoryId: p.category?.categoryId || '',
            subcategoryId: p.subcategory?.subcategoryId || ''
        });
        setIsEditing(false);
        setEditingProductId(null);
        window.scrollTo(0, 0);
        toast('Details Copied (Add Similar)', { icon: '📋' });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingProductId(null);
        setProductForm({ productName: '', description: '', price: '', quantityInStock: '', categoryId: '', subcategoryId: '' });
    };

    // Helpers
    const getFilteredProducts = () => {
        if (!searchQuery) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.productName.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            p.price.toString().includes(query) ||
            (p.category && p.category.categoryName.toLowerCase().includes(query))
        );
    };

    const getProductsByCategory = (catId) => getFilteredProducts().filter(p => p.category?.categoryId === catId);
    const getUncategorizedProducts = () => getFilteredProducts().filter(p => !p.category);

    if (loading) return <div>Loading...</div>;
    if (!store) return <div>Please Setup Store First.</div>;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>{store.storeName} - Inventory Control</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    ⬅ Back
                </button>
            </div>

            {/* --- Categories & Subcategories Management --- */}
            <div className="card" style={{ marginTop: '1rem' }}>
                <h3>Categories & Subcategories</h3>

                {/* Add New Category */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        className="input-field"
                        placeholder="New Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button className="btn btn-outline" onClick={handleAddCategory}>Add Category</button>
                </div>

                {/* Add New Subcategory */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                    <select
                        className="input-field"
                        value={newSubcategory.categoryId}
                        onChange={(e) => setNewSubcategory({ ...newSubcategory, categoryId: e.target.value })}
                        style={{ flex: 1 }}
                    >
                        <option value="">Select Category for Subcategory</option>
                        {categories.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                        ))}
                    </select>
                    <input
                        className="input-field"
                        placeholder="Subcategory Name"
                        value={newSubcategory.name}
                        onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-outline" onClick={handleAddSubcategory}>Add Subcategory</button>
                </div>

                {/* Categories List with Subcategories */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {categories.map(cat => (
                        <div key={cat.categoryId} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                            {/* Category Header */}
                            <div style={{
                                background: '#f9f9f9',
                                padding: '0.75rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderBottom: expandedCategory === cat.categoryId ? '1px solid #ddd' : 'none'
                            }}>
                                <button
                                    onClick={() => setExpandedCategory(expandedCategory === cat.categoryId ? null : cat.categoryId)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        padding: '0 0.5rem'
                                    }}
                                >
                                    {expandedCategory === cat.categoryId ? '▼' : '▶'}
                                </button>

                                {editingCategory?.id === cat.categoryId ? (
                                    <>
                                        <input
                                            value={editingCategory.name}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                            style={{ padding: '4px', flex: 1 }}
                                        />
                                        <button onClick={handleUpdateCategory} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>✅</button>
                                        <button onClick={() => setEditingCategory(null)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>❌</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1, fontWeight: '600' }}>{cat.categoryName}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                            ({subcategories[cat.categoryId]?.length || 0} subcategories)
                                        </span>
                                        <button
                                            onClick={() => setEditingCategory({ id: cat.categoryId, name: cat.categoryName })}
                                            style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.9rem' }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.categoryId)}
                                            style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.9rem', color: '#d32f2f' }}
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Subcategories List (Collapsible) */}
                            {expandedCategory === cat.categoryId && (
                                <div style={{ padding: '1rem', background: 'white' }}>
                                    {subcategories[cat.categoryId]?.length > 0 ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {subcategories[cat.categoryId].map(subcat => (
                                                <div
                                                    key={subcat.subcategoryId}
                                                    style={{
                                                        border: '1px solid #e0e0e0',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '6px',
                                                        background: '#fafafa',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    {editingSubcategory?.id === subcat.subcategoryId ? (
                                                        <>
                                                            <input
                                                                value={editingSubcategory.name}
                                                                onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                                                                style={{ padding: '2px 4px', fontSize: '0.9rem' }}
                                                            />
                                                            <button onClick={handleUpdateSubcategory} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.8rem' }}>✅</button>
                                                            <button onClick={() => setEditingSubcategory(null)} style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.8rem' }}>❌</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span style={{ fontSize: '0.9rem' }}>{subcat.subcategoryName}</span>
                                                            <button
                                                                onClick={() => setEditingSubcategory({ id: subcat.subcategoryId, name: subcat.subcategoryName, categoryId: cat.categoryId })}
                                                                style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.75rem' }}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubcategory(subcat.subcategoryId)}
                                                                style={{ cursor: 'pointer', border: 'none', background: 'none', fontSize: '0.75rem', color: '#d32f2f' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>No subcategories yet</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Product Form --- */}
            <div id="product-form-section" className="card" style={{ marginTop: '2rem', border: isEditing ? '2px solid var(--primary)' : '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>{isEditing ? `Editing: ${productForm.productName}` : 'Add New Product'}</h3>
                    {isEditing && <button className="btn btn-outline" onClick={handleCancelEdit}>Cancel Edit Mode</button>}
                </div>
                <form onSubmit={handleSubmitProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    <input className="input-field" placeholder="Product Name" value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} required />

                    <select
                        className="input-field"
                        value={productForm.categoryId}
                        onChange={e => setProductForm({ ...productForm, categoryId: e.target.value, subcategoryId: '' })}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                        ))}
                    </select>

                    <input className="input-field" placeholder="Price" type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />

                    <select
                        className="input-field"
                        value={productForm.subcategoryId}
                        onChange={e => setProductForm({ ...productForm, subcategoryId: e.target.value })}
                        disabled={!productForm.categoryId}
                        style={{ opacity: !productForm.categoryId ? 0.5 : 1 }}
                    >
                        <option value="">Select Subcategory (Optional)</option>
                        {productForm.categoryId && subcategories[productForm.categoryId]?.map(subcat => (
                            <option key={subcat.subcategoryId} value={subcat.subcategoryId}>{subcat.subcategoryName}</option>
                        ))}
                    </select>

                    <input className="input-field" placeholder="Quantity" type="number" value={productForm.quantityInStock} onChange={e => setProductForm({ ...productForm, quantityInStock: e.target.value })} required />
                    <textarea className="input-field" placeholder="Description" style={{ gridColumn: '1 / -1' }} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label>Images {isEditing && "(Upload to Replace All)"}</label>
                        <input type="file" multiple accept="image/*" className="input-field" onChange={handleFileChange} />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>
                        {isEditing ? 'Update Product' : 'Save Product'}
                    </button>
                </form>
            </div>

            {/* --- Product List Header & Search --- */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h2>Product List</h2>
                <input
                    className="input-field"
                    placeholder="Search by Name, Category, Price..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
            </div>

            {/* --- Product Grid --- */}
            <div style={{ marginTop: '1rem' }}>
                {categories.map(cat => {
                    const catProducts = getProductsByCategory(cat.categoryId);
                    if (searchQuery && catProducts.length === 0) return null; // Hide empty categories during search

                    return (
                        <div key={cat.categoryId} style={{ marginBottom: '2rem' }}>
                            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', color: '#444' }}>{cat.categoryName}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                {catProducts.length === 0 && !searchQuery && <p style={{ color: '#aaa', fontStyle: 'italic' }}>No products.</p>}
                                {catProducts.map(p => (
                                    <ProductCard
                                        key={p.productId}
                                        product={p}
                                        onEdit={() => handleEditClick(p)}
                                        onSimilar={() => handleAddSimilar(p)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Uncategorized */}
                {(function () {
                    const uncatProducts = getUncategorizedProducts();
                    if (searchQuery && uncatProducts.length === 0) return null;
                    if (uncatProducts.length === 0 && !searchQuery) return null;

                    return (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3>Uncategorized</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                {uncatProducts.map(p => (
                                    <ProductCard
                                        key={p.productId}
                                        product={p}
                                        onEdit={() => handleEditClick(p)}
                                        onSimilar={() => handleAddSimilar(p)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* No Results Message */}
                {searchQuery && products.filter(p =>
                    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    p.price.toString().includes(searchQuery) ||
                    (p.category && p.category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
                ).length === 0 && (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No products found matching "{searchQuery}"</p>
                    )}
            </div>

            {/* --- Group the Categories --- */}
            <div className="card" style={{ marginTop: '3rem' }}>
                <h2>Group the Categories</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Assign your categories to predefined sections for better organization in customer view</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    {['Electronics', 'Groceries', 'Fashion', 'Home & Kitchen'].map(section => {
                        const sectionCategories = categories.filter(cat => cat.section === section);
                        return (
                            <div key={section} style={{
                                border: '2px solid #e0e0e0',
                                borderRadius: '12px',
                                padding: '1rem',
                                background: '#fafafa'
                            }}>
                                <h3 style={{
                                    margin: '0 0 1rem 0',
                                    fontSize: '1.1rem',
                                    color: 'var(--primary)',
                                    borderBottom: '2px solid var(--primary)',
                                    paddingBottom: '0.5rem'
                                }}>
                                    {section}
                                </h3>
                                {sectionCategories.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {sectionCategories.map(cat => (
                                            <div key={cat.categoryId} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.5rem',
                                                background: 'white',
                                                borderRadius: '6px',
                                                border: '1px solid #e0e0e0'
                                            }}>
                                                <span style={{ fontSize: '0.9rem' }}>{cat.categoryName}</span>
                                                <button
                                                    onClick={() => handleAssignSection(cat.categoryId, null)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        border: 'none',
                                                        background: 'none',
                                                        color: '#d32f2f',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    title="Remove from section"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#999', fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>
                                        No categories assigned
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Ungrouped Categories */}
                {(() => {
                    const ungrouped = categories.filter(cat => !cat.section);
                    if (ungrouped.length === 0) return null;

                    return (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Ungrouped Categories</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {ungrouped.map(cat => (
                                    <div key={cat.categoryId} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem',
                                        background: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd'
                                    }}>
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{cat.categoryName}</span>
                                        <select
                                            className="input-field"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAssignSection(cat.categoryId, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                fontSize: '0.85rem',
                                                minWidth: '140px'
                                            }}
                                        >
                                            <option value="">Assign to...</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Groceries">Groceries</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home & Kitchen">Home & Kitchen</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

const ProductCard = ({ product, onEdit, onSimilar }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNextImage = () => {
        if (product.imageUrls && product.imageUrls.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
        }
    };

    const handlePrevImage = () => {
        if (product.imageUrls && product.imageUrls.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + product.imageUrls.length) % product.imageUrls.length);
        }
    };

    return (
        <div className="card" style={{ transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' }, position: 'relative' }}>
            <div style={{ height: '180px', background: '#f4f4f4', marginBottom: '1rem', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {product.imageUrls && product.imageUrls.length > 0 ? (
                    <>
                        <img
                            src={`http://localhost:8080${product.imageUrls[currentImageIndex]}`}
                            alt={product.productName}
                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        />
                        {product.imageUrls.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    style={{
                                        position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                        width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    style={{
                                        position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                                        width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    ›
                                </button>
                                <div style={{
                                    position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem'
                                }}>
                                    {currentImageIndex + 1}/{product.imageUrls.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <span style={{ color: '#aaa' }}>No Image</span>
                )}
            </div>

            <h4 style={{ margin: '0 0 0.5rem 0', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{product.productName}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>₹{product.price}</span>
                <span style={{ color: '#666', fontWeight: 'normal' }}>Qty: {product.quantityInStock}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button onClick={onEdit} className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>
                    Edit
                </button>
                <button onClick={onSimilar} className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>
                    Similar
                </button>
            </div>
        </div>
    );
};

export default Inventory;
