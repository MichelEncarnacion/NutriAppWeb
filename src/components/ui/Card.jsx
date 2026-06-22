// src/components/ui/Card.jsx
export default function Card({ as: Tag = "div", className = "", children, ...props }) {
    return (
        <Tag
            className={`bg-dark-800 border border-dark-600 rounded-xl p-5 ${className}`}
            {...props}
        >
            {children}
        </Tag>
    );
}
