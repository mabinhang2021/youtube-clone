"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { FilterCarousel } from "@/components/filter-carousel";

interface CategoriesSectionProps {
  categoryId?: string;
};

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
  return (
    <Suspense fallback={<CategoriesSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export const CategoriesSectionSkeleton = () => {
  return <FilterCarousel isLoading data={[]} onSelect={() => {}} />
};

const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  // const onSelect = (value: string | null) => {
  //   const url = new URL(window.location.href);

  //   if (value) {
  //     url.searchParams.set("categoryId", value);
  //   } else {
  //     url.searchParams.delete("categoryId");
  //   }

  //   router.push(url.toString());
  // };
  const onSelect = (value: string | null) => {
    // 确定当前页面是首页还是搜索页
    const isSearchPage = window.location.pathname.includes("/search");
    
    // 使用正确的基础URL
    const baseURL = isSearchPage ? "/search" : "/";
    const url = new URL(baseURL, window.location.origin);
    
    // 保留当前的查询参数
    const currentQuery = new URLSearchParams(window.location.search);
    for (const [key, value] of currentQuery.entries()) {
      if (key !== "categoryId") {
        url.searchParams.set(key, value);
      }
    }
    
    // 设置类别ID
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    
    router.push(url.toString());
  };

  return <FilterCarousel onSelect={onSelect} value={categoryId} data={data} />
};
