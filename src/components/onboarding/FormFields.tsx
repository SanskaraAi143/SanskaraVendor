import React from 'react';

export const FormField: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean
}> = ({ label, name, value, onChange, placeholder, type = "text", required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-gray-800 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        />
    </div>
);

export const TextAreaField: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number
}> = ({ label, name, value, onChange, placeholder, required = false, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-gray-800 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        />
    </div>
);

export const SelectField: React.FC<{
    label: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    required?: boolean
}> = ({ label, name, value, onChange, children, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-gray-800 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        >
            <option value="" disabled>Select option</option>
            {children}
        </select>
    </div>
);

export const CheckboxField: React.FC<{
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inline?: boolean;
    [key: string]: any
}> = ({ label, name, checked, onChange, inline=false, ...rest }) => (
    <div className={`custom-checkbox ${inline ? 'inline-block mr-4' : ''}`}>
        <input id={name} name={name} type="checkbox" checked={checked} onChange={onChange} {...rest} />
        <label htmlFor={name}>{label}</label>
    </div>
);

export const RadioGroupField: React.FC<{
    options: string[];
    name: string;
    selected: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inline?: boolean
}> = ({ options, name, selected, onChange, inline=false }) => (
    <div className={`flex ${inline ? 'space-x-4' : 'flex-col space-y-2'}`}>
        {options.map(opt =>
            <div key={opt} className="custom-radio">
                <input type="radio" id={`${name}_${opt}`} name={name} value={opt} checked={selected === opt} onChange={onChange} />
                <label htmlFor={`${name}_${opt}`}>{opt}</label>
            </div>
        )}
    </div>
);
