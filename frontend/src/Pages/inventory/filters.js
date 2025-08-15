import '../../Styles/Inventory.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Filters({ onFilterChange }){
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        supplier_id: 'all',
        category_id: 'all',
        status: 'all',
        size_id: 'all',
        color_id: 'all',
        material_id: 'all'
    });

    useEffect(() => {
        const load = async () => {
            try { const s = await axios.get('http://localhost:8000/api/suppliers/'); setSuppliers(s.data); } catch {}
            try { const c = await axios.get('http://localhost:8000/api/categories/'); setCategories(c.data); } catch {}
            try { const sz = await axios.get('http://localhost:8000/api/sizes/'); setSizes(sz.data); } catch {}
            try { const col = await axios.get('http://localhost:8000/api/colors/'); setColors(col.data); } catch {}
            try { const mat = await axios.get('http://localhost:8000/api/materials/'); setMaterials(mat.data); } catch {}
        };
        load();
    }, []);

    const update = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        onFilterChange && onFilterChange(next);
    };

    return(
        <div className="inventory-filters">
            <div className="filter-row">
                <input 
                    type="text" 
                    placeholder="Search by product name, category (Jeans, T-shirts, etc.), size, color..." 
                    value={filters.search} 
                    onChange={(e)=> update('search', e.target.value)} 
                />
                <select value={filters.supplier_id} onChange={(e)=> update('supplier_id', e.target.value)}>
                    <option value="all">All Suppliers</option>
                    {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                <select value={filters.category_id} onChange={(e)=> update('category_id', e.target.value)}>
                    <option value="all">All Categories</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <select value={filters.status} onChange={(e)=> update('status', e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Defective">Defective</option>
                    <option value="Returned">Returned</option>
                    <option value="Sold">Sold</option>
                </select>
                <select value={filters.size_id} onChange={(e)=> update('size_id', e.target.value)}>
                    <option value="all">All Sizes</option>
                    {sizes.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                <select value={filters.color_id} onChange={(e)=> update('color_id', e.target.value)}>
                    <option value="all">All Colors</option>
                    {colors.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <select value={filters.material_id} onChange={(e)=> update('material_id', e.target.value)}>
                    <option value="all">All Materials</option>
                    {materials.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
            </div>
        </div>
    )
}