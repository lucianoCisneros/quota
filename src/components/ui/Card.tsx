import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: "default" | "glass" | "gradient";
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
    const baseStyles = "rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden";

    const variants = {
        default: "bg-white/5 border-white/5",
        glass: "bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl",
        gradient: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-white/5"
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
