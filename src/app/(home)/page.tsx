import {ErrorBoundary} from "react-error-boundary";
import {HydrateClient, trpc} from "@/trpc/server";
import {Suspense} from "react";
import {PageClient} from "./client";
export default async function Home() {
  void trpc.hello.prefetch({text: "world"});
  
  return(
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <PageClient/>
      </ErrorBoundary>
       
      </Suspense>
    </HydrateClient>
    
  )
}
