// src/components/ui/Card.jsx
export default function Card({ as: Tag = "div", className = "", children, ...props }) {
    return (
        <Tag
            className={`bg-dark-800 border border-dark-600 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${className}`}
            {...props}
        >
            {children}
        </Tag>
    );
}
