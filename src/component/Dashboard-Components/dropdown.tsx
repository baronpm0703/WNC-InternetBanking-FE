import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faAngleRight, faSearch } from '@fortawesome/free-solid-svg-icons';

type Item = {
    attribute1: string;
    attribute2: string;
};

type ItemDropdownProps = {
    title: string,
    items: Item[];
    selectedItem: Item;
    setSelectedItem: (item: Item) => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (isOpen: boolean) => void;
};

const ItemDropdown: React.FC<ItemDropdownProps> = ({
    title,
    items,
    selectedItem,
    setSelectedItem,
    isDropdownOpen,
    setIsDropdownOpen,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredItems = items.filter(item =>
        item.attribute1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.attribute2.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDropdownClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the click event from bubbling up
    };

    useLayoutEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && event.target && !dropdownRef.current.contains(event.target as Node) && !(event.target as Element).closest('.dropdown-toggle')) {
                console.log('Clicked outside');
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsDropdownOpen]);

    return (
        <div
            ref={dropdownRef}
            className="absolute top-full left-0 w-full bg-white text-black rounded-2xl shadow-xl mt-3 z-10"
            onClick={handleDropdownClick} // Attach the click handler
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-400 text-center">{title}</p>
                <FontAwesomeIcon
                    icon={faCircleXmark}
                    className="w-5 h-5 text-red-300 hover:text-red-500 cursor-pointer transition"
                    aria-label="Close"
                    onClick={() => setIsDropdownOpen(false)}
                />
            </div>

            {/* Search Bar */}
            <div className="px-4 py-2 flex items-center">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
            </div>

            {/* Dropdown items or Not Found message */}
            {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                    <div
                        key={item.attribute1}
                        className="items-center pl-2 pr-2 pt-1 pb-1"
                        onClick={() => {
                            setSelectedItem(item);
                            setIsDropdownOpen(false);
                        }}
                    >
                        <div className="flex items-center hover:bg-[#ecf4e3] cursor-pointer rounded-2xl transition-all duration-300 ease-in-out p-2">
                            <img
                                src="https://cdn.britannica.com/65/227665-050-D74A477E/American-actor-Leonardo-DiCaprio-2016.jpg"
                                alt="Avatar"
                                className="w-10 h-10 rounded-full mr-4 object-cover"
                            />
                            <div>
                                <p className="text-md font-semibold text-black">{item.attribute1}</p>
                                <p className="text-gray-600 text-xs font-medium">{item.attribute2}</p>
                            </div>
                            <div className="ml-auto">
                                <FontAwesomeIcon icon={faAngleRight} className="text-gray-400 w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="px-4 py-2 text-center text-gray-500">
                    Not Found
                </div>
            )}
        </div>
    );
};

export default ItemDropdown;