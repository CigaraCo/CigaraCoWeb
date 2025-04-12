
import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Hero from '@/components/Home/Hero';
import ProductGrid from '@/components/Home/ProductGrid';

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <ProductGrid />
    </MainLayout>
  );
};

export default Index;
