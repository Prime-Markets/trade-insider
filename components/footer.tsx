"use client"
import React from 'react';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children, className = "hover:text-purple-600" }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
    
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://')) {
      window.open(href, '_blank');
      return;
    }
    let path = href;
    if (href.startsWith('/')) {
      path = href.substring(1); 
    }
    if (path.endsWith('.html')) {
      path = path.substring(0, path.length - 5);
    }
    
    const fullUrl = `https://prime.primemarkets.co.za/${path}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

const FooterComponent: React.FC = () => {
  const handleAppDownload = (type: 'appstore' | 'playstore' | 'custom'): void => {
    switch (type) {
      case 'appstore':
        window.open('https://prime.primemarkets.co.za/download/ios', '_blank');
        break;
      case 'playstore':
        window.open('https://prime.primemarkets.co.za/download/android', '_blank');
        break;
      case 'custom':
        window.open('https://prime.primemarkets.co.za/download', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <footer className="bg-white py-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center md:flex-row md:justify-center md:items-center mb-8">
          <h2 className="sr-only">Download Our App</h2>
          <div className="flex flex-col justify-between w-full sm:flex-row sm:space-x-4">
            <div>
              <button onClick={() => handleAppDownload('custom')} className="inline-block mb-4 sm:mb-0">
                <img
                  src="https://factsheets.digitallandscape.co.za/site/images/PrimeMarkets-premium-trading.png"
                  alt="PrimeMarkets Logo"
                  className="h-12 object-contain"
                />
              </button>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => handleAppDownload('playstore')} className="inline-block">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-12 object-contain"
                />
              </button>
              <button onClick={() => handleAppDownload('appstore')} className="inline-block">
                <img
                  src="https://www.sharenet.co.za/v3/images/appBtn2.png"
                  alt="Download on the App Store"
                  className="h-12 object-contain"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Trade
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><FooterLink href="/forex">Forex</FooterLink></li>
              <li><FooterLink href="/stocks">Stocks</FooterLink></li>
              <li><FooterLink href="/commodities">Commodities</FooterLink></li>
              <li><FooterLink href="/cryptocurrency">Cryptocurrencies</FooterLink></li>
              <li><FooterLink href="/indices">Indices</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Accounts
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><FooterLink href="/accounts">Account Types Overview</FooterLink></li>
              <li><FooterLink href="/accounts#individual">Individual Account</FooterLink></li>
              <li><FooterLink href="/accounts#joint">Joint Account</FooterLink></li>
              <li><FooterLink href="/accounts#demo">Demo Account</FooterLink></li>
              <li><FooterLink href="/accounts#corporate">Corporate Account</FooterLink></li>
              <li><FooterLink href="/refer-a-friend">Refer A Friend</FooterLink></li>
              <li><FooterLink href="/bonus-and-credit">Bonus & Credit</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              About Prime Markets
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><FooterLink href="/about-prime-markets">About Prime Markets</FooterLink></li>
              <li><FooterLink href="/reviews">Reviews</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><FooterLink href="/news">News</FooterLink></li>
              <li><FooterLink href="/funding-and-withdrawals">Funding & Withdrawals</FooterLink></li>
              <li><FooterLink href="/personal-support-managers">Personal Support Manager</FooterLink></li>
              <li><FooterLink href="/faqs">FAQs</FooterLink></li>
              <li><FooterLink href="/economic-calendar">Economic Calendar</FooterLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><FooterLink href="/terms-and-conditions">Terms & Conditions</FooterLink></li>
              <li><FooterLink href="/privacy-policy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/risk-disclosure">Risk Disclosure</FooterLink></li>
              <li><FooterLink href="/bonus-promotion">Bonus Promotion</FooterLink></li>
              <li><FooterLink href="/interest-promotion">Interest Promotion</FooterLink></li>
              <li><FooterLink href="/liquidity-advance-promotion">Liquidity Advance Promotion</FooterLink></li>
              <li><FooterLink href="/prima-manual">PIMA Manual</FooterLink></li>
              <li><FooterLink href="/complaints-policy">Complaints Policy</FooterLink></li>
              <li><FooterLink href="/swap-back-promotion">Swap Back Promotion</FooterLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-black p-3 text-center text-xs">
        <div className="max-w-7xl mx-auto text-left text-gray-700">
          <h5 className="font-bold">PrimeMarkets Role</h5>
          <p>
            It's essential for our clients to know that all trades on PrimeMarkets are
            executed through third-party liquidity providers, with whom the responsibility
            for the execution of client orders lies. As an STP broker, PrimeMarkets does
            not have control over the swaps and fees determined by market conditions and
            liquidity providers. Importantly, as a licensed intermediary, PrimeMarkets
            facilitates trades between clients and third-party liquidity providers.
            Consequently, PrimeMarkets operates only as a trading platform and does not
            make a market, issue or sell financial instruments nor is it a money manager or fund manager.
          </p>

          <h5 className="font-bold mt-2">Regulatory Compliance</h5>
          <p>
            PrimeMarkets PTY Ltd, a corporation duly registered under the laws of South Africa
            (Registration Number: 2023/845826/07; License Number: 54322), with its registered
            office at Club Place, Anton Lambede Street, Durban, 4001, South Africa, is
            authorised and regulated, adhering to the highest standards of compliance and
            transparency. PrimeMarkets does not offer products or services to residents of
            certain jurisdictions including, but not limited to, the USA and Canada.
          </p>

          <h5 className="font-bold mt-2">Trademark and Legal Notices</h5>
          <p>
            The PrimeMarkets name, logo, and related trademarks are properties of PrimeMarkets,
            protected under trademark law. Unauthorised use is prohibited.
          </p>

          <h5 className="font-bold mt-2">Risk Warning</h5>
          <p>
            Trading online carries a high level of risk and may not be suitable for all
            investors. Before deciding to trade, consider your investment objectives,
            experience level, and risk appetite. Note that you could incur a loss of some or
            all of your initial investment.
          </p>

          <h5 className="font-bold mt-2">Privacy and Data Protection</h5>
          <p>
            For privacy concerns, contact{' '}
            <FooterLink href="mailto:support@primemarkets.co.za" className="underline">
              support@primemarkets.co.za
            </FooterLink>. Read our Privacy Policy for details on data handling. PrimeMarkets is
            compliant with the Protection of Personal Information Act and registered with
            the South African Information Regulator.
          </p>

          <h5 className="font-bold mt-2">Leveraged Trading Note</h5>
          <p>
            Leveraged trading is complex and comes with a high risk of losing money rapidly
            due to leverage. Most retail investor accounts lose money when trading. Understand
            the risks involved and consider seeking independent advice. The investment amount
            refers to the net amount of funds (excluding withdrawals) deposited by the client
            for trading CFDs and making independent investment decisions. For more detailed
            information, please review our Risk Disclosure Statement and Terms and Conditions.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;