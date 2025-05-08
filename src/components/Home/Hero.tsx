import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 bg-cream overflow-hidden">
      {/* Background image for the whole hero section */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src="public/lovable-uploads/8d93498e-c223-4478-84c4-1509ffbd73d8.png" 
          alt="Cigára Co. Premium Accessories" 
          className="w-full h-full object-cover object-center opacity-20" 
        />
        {/* Optional: overlay to keep text readable */}
      </div>
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-3xl md:w-1/2">
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
                className="btn-primary inline-flex items-center group mb-4"
              >
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          {/* <div className="relative w-full max-w-lg">
            <img 
              src="public/lovable-uploads/8d93498e-c223-4478-84c4-1509ffbd73d8.png" 
              alt="Cigára Co. Premium Accessories" 
              className="rounded-lg shadow-xl max-w-full h-auto"
            />
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
