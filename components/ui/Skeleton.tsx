// components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
    height?: string;
    width?: string;
    className?: string;
}

const SkeletonElement: React.FC<SkeletonProps> = ({ height = 'h-4', width = 'w-full', className = '' }) => (
    <div className={`bg-gray-200 rounded ${height} ${width} ${className}`}></div>
);

export const SkeletonCard: React.FC = () => (
    <div className="bg-white p-4 rounded-xl shadow-lg animate-pulse h-40 space-y-3 border border-gray-100">
        <SkeletonElement width="w-1/2" />
        <SkeletonElement width="w-2/3" height="h-6" className="mt-2" />
        <div className="flex justify-between items-center pt-2 border-t mt-4">
            <SkeletonElement width="w-1/4" />
            <SkeletonElement width="w-1/5" />
        </div>
    </div>
);

export const SkeletonSummaryCard: React.FC = () => (
    <div className="bg-gray-900 p-4 rounded-xl shadow-lg animate-pulse h-28 flex justify-between items-center text-white">
        <div className="space-y-2">
            <SkeletonElement width="w-20" height="h-3" className="bg-gray-700" />
            <SkeletonElement width="w-32" height="h-8" className="bg-gray-600" />
        </div>
        <div className="space-y-2">
            <SkeletonElement width="w-20" height="h-3" className="bg-gray-700" />
            <SkeletonElement width="w-24" height="h-8" className="bg-gray-600" />
        </div>
    </div>
);
