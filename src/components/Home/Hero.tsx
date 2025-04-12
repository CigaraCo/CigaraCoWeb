
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20 md:py-32 bg-cream">
      <div className="container-custom">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-medium text-charcoal mb-6 animate-fade-in">
            Cigára Co.
          </h1>
          <div className="animation-delay-200 animate-slide-in">
            <p className="text-xl md:text-2xl text-dark-gray mb-8 leading-relaxed">
              Premium accessories for modern connoisseurs. <br />
              Cigára Co. introduces an elevated smoking experience in Amman, JO.
            </p>
            <p className="text-lg text-dark-gray mb-8 leading-relaxed">
              We seamlessly blend innovation and elegance, offering a curated selection of premium IQOS-compatible accessories. Explore our bespoke storage solutions designed exclusively for cigarettes and TEREA packs, tailored for those who appreciate the finer things in life. Join us in redefining sophistication in smoking and indulge in a collection that speaks to your style and taste.
            </p>
            <Link to="/#products" 
              className="btn-primary inline-flex items-center group"
            >
              Explore Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
