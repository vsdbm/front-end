import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Dropdown, Form, InputGroup, Button } from 'react-bootstrap';
import colors from '../static/colors';

const SearchableSelect = ({ options, onChange, placeholder = "Select..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);

    const fuse = useMemo(() => new Fuse(options, {
        keys: ['label'],
        threshold: 0.3,
    }), [options]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return fuse.search(searchTerm).map(result => result.item);
    }, [searchTerm, options, fuse]);

    const handleSelect = (option, e) => {
        e.preventDefault();
        setSelectedOption(option);
        setSearchTerm('');
        if (onChange) onChange(option);
    };

    // Custom Toggle to display the selected option
    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <div
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            className="form-control d-flex justify-content-between align-items-center cursor-pointer"
            style={{ cursor: 'pointer', backgroundColor: colors.color7, color: '#fff' }}
        >
            <span>{children}</span>
            <span className="text-muted">▼</span>
        </div>
    ));

    // Custom Menu to include the search input
    const CustomMenu = React.forwardRef(
        ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
            return (
                <div
                    ref={ref}
                    style={style}
                    className={className}
                    aria-labelledby={labeledBy}
                >
                    <div className="px-3 py-2">
                        <InputGroup>
                            <Form.Control
                                autoFocus
                                placeholder="Search..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                                value={searchTerm}
                            />
                            {searchTerm && (
                                <Button
                                    variant="danger"
                                    onClick={() => setSearchTerm('')}
                                    style={{ zIndex: 0 }}
                                >
                                    ✕
                                </Button>
                            )}
                        </InputGroup>
                    </div>
                    <ul className="list-unstyled mb-0" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {children}
                    </ul>
                </div>
            );
        },
    );

    return (
        <Dropdown className="w-100">
            <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                {selectedOption ? selectedOption.label : placeholder}
            </Dropdown.Toggle>

            <Dropdown.Menu as={CustomMenu} className="w-100" style={{ backgroundColor: colors.color7, color: '#fff' }}>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <Dropdown.Item
                            className="custom-dropdown-item"
                            key={option.value}
                            eventKey={option.value}
                            onClick={(e) => handleSelect(option, e)}
                            title={option.label}
                            active={selectedOption && selectedOption.value === option.value}
                        >
                            {option.label}
                        </Dropdown.Item>
                    ))
                ) : (
                    <div className="p-2 text-muted text-center">No results found</div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default SearchableSelect;
