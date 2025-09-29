import React, { useEffect, useState, useMemo } from 'react';
import './stockedProducts.css';
import axios from '../../api/axiosInstance';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

const PAGE_SIZE = 10;

const StockedProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: SORT_DIRECTIONS.ASC });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products once on mount
  useEffect(() => {
    const fetchStockedProducts = async () => {
      try {
        const response = await axios.get('inventory/stocked-products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching stocked products:', error);
      }
    };
    fetchStockedProducts();
  }, []);

  const onSort = (key) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === SORT_DIRECTIONS.ASC ? SORT_DIRECTIONS.DESC : SORT_DIRECTIONS.ASC,
        };
      }
      return { key, direction: SORT_DIRECTIONS.ASC };
    });
  };

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let filtered = products;
    if (term) {
      filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.barcode && p.barcode.toLowerCase().includes(term))
      );
    }

    const sorted = filtered.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === SORT_DIRECTIONS.ASC ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === SORT_DIRECTIONS.ASC ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === SORT_DIRECTIONS.ASC ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [products, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredSorted.length / PAGE_SIZE);
  const pagedProducts = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === SORT_DIRECTIONS.ASC ? <FiChevronUp /> : <FiChevronDown />;
  };

  const Pagination = () => (
    <nav className="spu-pagination" aria-label="Product table pagination">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        Prev
      </button>
      <span aria-live="polite" aria-atomic="true" className="spu-pagination-info">
        Page {currentPage} of {totalPages || 1}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages || totalPages === 0}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );

  return (
    <section className="spu-container" aria-label="Stocked Products Table">
      <header className="spu-header">
        <h2>All Stocked Products</h2>
        <div className="spu-controls">
          <div className="spu-search-wrapper">
            <FiSearch className="spu-search-icon" aria-hidden="true" />
            <label htmlFor="product-search" className="spu-visually-hidden">
              Search by name or barcode
            </label>
            <input
              id="product-search"
              type="search"
              className="spu-search-input"
              placeholder="Search by name or barcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              aria-describedby="spu-search-desc"
            />
            <span id="spu-search-desc" className="spu-visually-hidden">
              Type product name or barcode to filter the table
            </span>
          </div>
        </div>
      </header>

      <div className="spu-table-container">
        <table role="table" aria-describedby="spu-product-count" cellPadding="0" cellSpacing="0">
          <thead>
            <tr>
              {[
                { key: 'product_id', label: 'Product ID' },
                { key: 'name', label: 'Name' },
                { key: 'category_name', label: 'Category' },
                { key: 'stock', label: 'Stock' },
                { key: 'selling_price', label: 'Price' },
                { key: 'location', label: 'Location' },
                { key: 'supplier_name', label: 'Supplier' },
                { key: 'expiry_date', label: 'Expiry Date' },
                { key: 'barcode', label: 'Barcode' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  role="columnheader"
                  scope="col"
                  onClick={() => onSort(key)}
                  aria-sort={sortConfig.key === key ? sortConfig.direction : 'none'}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSort(key)}
                  className="spu-sortable"
                >
                  {label} {renderSortIcon(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedProducts.length ? (
              pagedProducts.map((item) => (
                <tr key={item.product_id} title={item.name}>
                  <td className="spu-truncate" title={item.product_id}>{item.product_id}</td>
                  <td className="spu-truncate" title={item.name}>{item.name}</td>
                  <td className="spu-truncate" title={item.category_name || '-'}>{item.category_name || '-'}</td>
                  <td className={item.stock < 10 ? 'spu-low-stock' : ''} title={item.stock.toString()}>
                    {item.stock}
                  </td>
                  <td>K{Number(item.selling_price).toFixed(2)}</td>
                  <td className="spu-truncate" title={item.location || '-'}>{item.location || '-'}</td>
                  <td className="spu-truncate" title={item.supplier_name || '-'}>{item.supplier_name || '-'}</td>
                  <td>{item.expiry_date || '-'}</td>
                  <td className="spu-truncate" title={item.barcode || '-'}>{item.barcode || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="spu-no-results">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div id="spu-product-count" className="spu-visually-hidden">
          {filteredSorted.length} products total
        </div>
      </div>

      <Pagination />
    </section>
  );
};

export default StockedProducts;
