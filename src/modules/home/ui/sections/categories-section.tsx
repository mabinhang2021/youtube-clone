'use client';

import { FilterCarousel } from "@/components/filter-carousel";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategoriesSectionProps {
    categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error...</p>}>
                <CategoriesSectionContent categoryId={categoryId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const CategoriesSectionContent = ({ categoryId }: CategoriesSectionProps) => {
    const { data: categories, isLoading, error } = trpc.categories.getMany.useQuery();
    
    if (isLoading) return <p>Loading categories...</p>;
    if (error) return <p>Error loading categories: {error.message}</p>;
    if (!categories) return <p>No categories found</p>;
    
    const filterData = categories.map((category) => ({
        value: category.id,
        label: category.name,
    }));
    
    return <FilterCarousel value={categoryId} data={filterData} />;
}