"use client";
import { useRouter } from "next/navigation";

interface CardProps {
  action: string;
  route: string;
};

export default function Card({ action, route}: CardProps) {
    const router = useRouter();
    
    return (
        <div className="card bg-primary text-primary-content w-96">
            <div className="card-body">
                <h2 className="card-title">{action}</h2>
                <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
                <div className="card-actions justify-end">
                <button onClick={() => router.push(route)} className="btn">Buy Now</button>
                </div>
            </div>
        </div>
    )
}