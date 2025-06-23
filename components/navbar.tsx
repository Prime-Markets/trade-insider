"use client"
import React, { useState, useEffect, useRef } from 'react';

interface MenuItem {
  icon: string;
  name: string;
  description: string;
  imageURL?: string;
}

interface Category {
  title: string;
  items: MenuItem[];
}

interface MenuItemType {
  key: string;
  title: string;
  categories: Category[];
}

const menuItems: MenuItemType[] = [
  {
    key: 'trade',
    title: 'Trade',
    categories: [
      {
        title: 'Markets',
        items: [
          { icon: 'trending-up', name: 'Forex', description: 'Elevate your trading experience with Prime Markets Forex.' },
          { icon: 'bar-chart-2', name: 'Stocks', description: 'Diversify your portfolio, amplify your returns.' },
          { icon: 'grid', name: 'Indices', description: 'Broad market exposure, tailored strategies.' },
          { icon: 'dollar-sign', name: 'Commodities', description: 'Elevate your commodity trading strategy.' },
          { icon: 'bitcoin', name: 'Crypto', description: 'Elevate your commodity trading strategy.' }
        ]
      },
      {
        title: 'What to trade',
        items: [
          { icon: 'trending-up', name: 'CFD Trading', description: 'Trade CFDs with competitive spreads' },
          { icon: 'grid', name: 'Account Types', description: 'Choose the right account for your needs' },
          { icon: 'dollar-sign', name: 'Fees and Charges', description: 'Clear and competitive pricing' }
        ]
      }
    ]
  },
  {
    key: 'resources',
    title: 'Platforms and tools',
    categories: [
      {
        title: 'Tools',
        items: [
          { icon: 'globe', name: 'News', description: 'Keep up to date with Primemarkets news events' },
          { icon: 'globe', name: 'Trade Insider', description: 'Keep up to date with Primemarkets Ai tool' },
        ]
      },
      {
        title: 'Platforms',
        items: [
          { icon: 'trending-up', name: 'PrimeMarket', description: 'Our trading Platform' }
        ]
      },
      {
        title: 'Resource Center',
        items: [
          { icon: 'trending-up', name: 'Funding and Withdrawals', description: 'Prime Markets secure deposit and swift withdrawal solution are supported by our commitment to security and transparency' },
          { icon: 'bar-chart-2', name: 'Personal Support Managers', description: 'Partner with a Personal Support Manager for personalized support and investment insights' },
          { icon: 'grid', name: 'FAQs', description: 'Find answers to your questions with Prime Markets detailed Frequently Asked Questions section' },
          { icon: 'dollar-sign', name: 'Economic Calendar', description: 'Prime Markets Economic Calendar make sure traders never miss an upcoming event' }
        ]
      }
    ]
  },
  {
    key: 'about',
    title: 'About Prime Markets',
    categories: [
      {
        title: 'About',
        items: [
          {
            icon: '',
            name: 'About Prime Markets',
            description: 'From local beginnings to global impact, our mission and values stand firm',
            imageURL: 'https://primemarkets.co.za/Images/MTR_TV_desktop_05.jpg'
          },
          {
            icon: '',
            name: 'Reviews',
            description: 'Discover the experience shared by our customers. Explore ratings and reviews about our services.',
            imageURL: 'https://primemarkets.co.za/Images/MTR_TV_mobile_03.jpg'
          }
        ]
      }
    ]
  },
  {
    key: 'verification',
    title: 'Verification',
    categories: []
  }
];

const icons: Record<string, string> = {
  'trending-up': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 17l6-6 4 4 8-8" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 7h7v7" />
  </svg>`,
  'bar-chart-2': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19V10M12 19V4M20 19v-5" />
  </svg>`,
  'grid': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
      <rect x="4" y="4" width="6" height="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <rect x="14" y="4" width="6" height="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <rect x="4" y="14" width="6" height="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <rect x="14" y="14" width="6" height="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
  </svg>`,
  'dollar-sign': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 5H9a3 3 0 000 6h6a3 3 0 010 6H7" />
  </svg>`,
  'globe': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>`,
  'bitcoin': `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727"/>
</svg>`
};

const getContactLink = (name: string): string => {
  switch (name.toLowerCase()) {
    case 'visit us':
      return 'https://maps.app.goo.gl/eeR7TM2ygbjUFURV9';
    case 'phone':
      return 'tel:+27104464170';
    case 'email':
      return 'mailto:support@primemarkets.co.za';
    case 'whatsapp':
      return 'https://wa.me/27104464170';
    default:
      return '#';
  }
};

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<'trade' | 'resources' | 'about' | 'accounts' | ''>('');
  const [activeMenuMobile, setActiveMenuMobile] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (key: string, type: 'mobile' | 'desktop'): void => {
    if (key === 'verification') {
      window.open(`https://prime.primemarkets.co.za/${key}`, '_blank');
      return;
    }
    if (type === 'mobile') {
      setActiveMenuMobile(prev => (prev === key ? null : key));
    } else {
      setActiveMenu(prev => (prev === key ? '' : key as '' | 'trade' | 'resources' | 'about' | 'accounts'));
    }
  };

  const getIcon = (name: string): string => icons[name] || '';

  const redirect = (value: string): void => {
    const accountsList = ['individual account', 'joint account', 'islamic account', 'demo account', 'corporate account'];
    
    let path = '';
    
    if (accountsList.includes(value)) {
      path = `accounts#${value.split(' ')[0]}`;
    } else if (value.toLowerCase() === 'cfd trading') {
      path = 'cfd-trading';
    } else if (value.toLowerCase() === 'account types') {
      path = 'accounts';
    } else if (value.toLowerCase() === 'fees and charges') { 
      path = 'cfd-trading/our-changes';
    } else {
      path = value.replaceAll(' ', '-').toLowerCase();
    }
    
    window.open(`https://prime.primemarkets.co.za/${path}`, '_blank');
    setIsMobileMenuOpen(false);
    setActiveMenu('');
    setActiveMenuMobile(null);
  };

  const closeMobileMenu = (): void => setIsMobileMenuOpen(false);

  const handleClickOutside = (e: MouseEvent): void => {
    if (navRef.current && !navRef.current.contains(e.target as Node)) {
      setActiveMenu('');
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const pathNameValue = window.location.pathname;
  const activeMenuData = menuItems.find(item => item.key === activeMenu);

  const handleHomeNavigation = (): void => {
    window.open('https://prime.primemarkets.co.za/', '_blank');
  };

  const handleLoginNavigation = (): void => {
    window.open('https://prime.primemarkets.co.za/myprimemarket', '_blank');
  };

  const handleGetStartedNavigation = (): void => {
    window.open('https://prime.primemarkets.co.za/get-started', '_blank');
  };

  return (
    <div ref={navRef} className="sticky top-0 z-50">
      <div className="bg-gray-200 text-black p-3 text-center text-[10px] md:text-xs">
        Trading CFDs requires skill, knowledge, and a clear understanding of the associated risks.
        Leveraged trading, in particular, carries a significant risk of losing all invested funds in a
        short period and may not be suitable for everyone.
      </div>
      <nav className="relative flex flex-col md:flex-row h-[70px] md:h-[100px] items-center p-4 shadow-md bg-white text-black">

        <div className="md:hidden flex items-center w-full">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 focus:outline-none p-2"
          >
            &#9776;
          </button>
          <button onClick={handleHomeNavigation}>
            <img
              className="h-10 sm:h-15 w-full md:w-auto"
              style={{ objectFit: 'contain' }}
              src="https://factsheets.digitallandscape.co.za/site/images/PrimeMarkets-premium-trading.png"
              alt="PrimeMarkets Logo"
            />
          </button>
        </div>

        <div className="hidden w-full md:flex flex-row items-center justify-between">
          <button onClick={handleHomeNavigation}>
            <img
              className="h-10 md:h-20 object-contain"
              src="https://factsheets.digitallandscape.co.za/site/images/PrimeMarkets-premium-trading.png"
              alt="PrimeMarkets Logo"
            />
          </button>
          <div className="flex-1 flex justify-center gap-10">
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={(e) => { e.stopPropagation(); toggleMenu(item.key, 'desktop'); }}
                className={`${activeMenu === item.key ? 'border-b-2 border-red-600' : ''} text-gray-700 focus:outline-none text-sm md:text-lg`}
              >
                {item.title}{item.categories.length > 0 && ' '}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLoginNavigation}
              className="w-[100px] text-center bg-slate-800 text-white px-3 py-1 md:px-4 md:py-2 rounded text-xs md:text-base"
            >
              Login
            </button>
            <button
              onClick={handleGetStartedNavigation}
              className="bg-indigo-600 text-white px-3 py-1 md:px-4 md:py-2 rounded text-xs md:text-base"
            >
              Get Started
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
              onClick={closeMobileMenu}
            />
            <div
              className={`fixed left-0 top-0 h-full w-72 bg-white shadow-xl p-6 transform transition-transform duration-300 ease-in-out z-50 ${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <button
                onClick={closeMobileMenu}
                className="text-gray-700 focus:outline-none absolute top-4 right-4 text-2xl"
              >
                &times;
              </button>
              <button onClick={handleHomeNavigation}>
                <img
                  className="h-10 w-full object-contain"
                  src="https://factsheets.digitallandscape.co.za/site/images/PrimeMarkets-premium-trading.png"
                  alt="PrimeMarkets Logo"
                />
              </button>
              <div className="mt-4">
                {menuItems.map(item => (
                  <div key={item.key} className="mt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMenu(item.key, 'mobile'); }}
                      className="text-gray-700 focus:outline-none text-lg block w-full text-left py-2 border-b border-gray-200"
                    >
                      {item.title}{item.categories.length > 0 && <span className="float-right"></span>}
                    </button>
                    {activeMenuMobile === item.key && (
                      <div className="ml-4 mt-2">
                        <ul className="space-y-2">
                          {item.categories.map(category => (
                            <li key={category.title}>
                              <h4 className="font-semibold mt-2">{category.title}</h4>
                              <ul>
                                {category.items.map(sub =>
                                  category.title === 'Contact Prime Markets' ? (
                                    <li key={sub.name} className="py-1">
                                      <a
                                        href={getContactLink(sub.name)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-indigo-600"
                                      >
                                        {sub.name}
                                      </a>
                                    </li>
                                  ) : (
                                    <li
                                      key={sub.name}
                                      className="py-1 cursor-pointer hover:text-indigo-600"
                                      onClick={() => redirect(sub.name.toLowerCase())}
                                    >
                                      {sub.name}
                                    </li>
                                  )
                                )}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeMenuData && (
          <div
            className="absolute bg-gray-100 shadow-lg p-4 md:p-6 border border-gray-200 w-full left-0 z-50"
            style={{ top: '100%' }}
          >
            <div className="flex flex-col md:flex-row gap-4">

              {(activeMenu === 'trade' || activeMenu === 'resources') ? (
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  {activeMenuData.categories.map(category => (
                    <div
                      key={category.title}
                      className="p-4 border-b md:border-r border-gray-300 w-full md:w-[500px]"
                    >
                      <h3 className="text-gray-900 font-semibold text-lg mb-3">{category.title}</h3>
                      <ul className="space-y-3 text-sm text-gray-700">
                        {category.items.map(sub => {
                          if (category.title === 'Contact Prime Markets') {
                            return (
                              <li key={sub.name}>
                                <a
                                  href={getContactLink(sub.name)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex py-3 px-2 hover:bg-gray-200 cursor-pointer items-start space-x-3 rounded"
                                >
                                  <div
                                    className="text-indigo-600"
                                    dangerouslySetInnerHTML={{ __html: getIcon(sub.icon) }}
                                  />
                                  <div>
                                    <p className="font-medium">{sub.name}</p>
                                    <p className="text-xs text-gray-500">{sub.description}</p>
                                  </div>
                                </a>
                              </li>
                            );
                          }
                          return (
                            <li
                              key={sub.name}
                              onClick={() => redirect(sub.name.toLowerCase())}
                              className={`flex py-3 px-2 hover:bg-gray-200 cursor-pointer items-start space-x-3 rounded ${
                                pathNameValue.includes(sub.name.toLowerCase()) ? 'bg-indigo-600 text-white' : ''
                              }`}
                            >
                              <div
                                className="text-indigo-600"
                                dangerouslySetInnerHTML={{ __html: getIcon(sub.icon) }}
                              />
                              <div>
                                <p className="font-medium">{sub.name}</p>
                                <p className={`text-xs ${
                                  pathNameValue.includes(sub.name.toLowerCase())
                                    ? 'text-white'
                                    : 'text-gray-500'
                                }`}>
                                  {sub.description}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                  {/* indicator */}
                  {activeMenu  === 'about' && (
                    <div className="p-4 border-b md:border-r border-gray-300 w-full md:w-[500px]">
                      <h3 className="text-gray-900 font-semibold text-lg mb-3">Location</h3>
                      <iframe
                        title="Prime Markets Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3460.145507467466!2d31.021776874802!3d-29.860077222750096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ef7a9c827e8faa9%3A0xfe80e7547dc65388!2s301%20Anton%20Lembede%20St%2C%20Durban%20Central%2C%20Durban%2C%204001!5e0!3m2!1sen!2sza!4v1746559256685!5m2!1sen!2sza" 
                        height="400"
                        width="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4 flex-1">
                  {activeMenuData.categories.map(category => (
                    <div key={category.title} className="col-span-1">
                      <h3 className="text-gray-900 font-semibold text-lg mb-3">{category.title}</h3>
                      <div className="flex flex-wrap gap-4">
                        {category.items.map(sub => (
                          <div
                            key={sub.name}
                            onClick={() => redirect(sub.name.toLowerCase())}
                            className="w-full md:w-60 hover:bg-gray-200 transition duration-500 cursor-pointer ease-in-out rounded-lg p-4 flex flex-col"
                          >
                            <img src={sub.imageURL} alt={sub.name} className="h-32 w-full object-cover mb-3 rounded" />
                            <h3 className="text-sm text-gray-700 font-semibold mb-2">{sub.name}</h3>
                            <p className="text-gray-500 mb-4 text-sm">{sub.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="hidden lg:block" style={{ width: '27%' }}>
                {activeMenu === 'accounts' ? (
                  <div className="p-4 border-b border-gray-300">
                    <h3 className="text-gray-900 font-semibold text-lg mb-3">Loyalty</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start space-x-3 py-3 px-2 hover:bg-gray-200 rounded cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l6-6 4 4 8-8" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 7h7v7" />
                        </svg>
                        <div>
                          <p className="font-medium">Refer a friend</p>
                          <p className="text-xs">Bring your friends and earn bonuses while strengthening relationships</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3 py-3 px-2 hover:bg-gray-200 rounded cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l6-6 4 4 8-8" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 7h7v7" />
                        </svg>
                        <div>
                          <p className="font-medium">Bonus and Credit</p>
                          <p className="text-xs">Take the first step in your trading venture with a 30% bonus.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4">
                    {/* <img
                      src="https://za.banxso.com/wp-content/uploads/2023/12/commission-menu.jpg"
                      alt="Promo"
                      className="mb-3 w-full h-auto object-contain"
                    />
                    <h2 className="text-base font-semibold text-center">
                      Trade your favourite assets with 0% commission!
                    </h2> */}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;