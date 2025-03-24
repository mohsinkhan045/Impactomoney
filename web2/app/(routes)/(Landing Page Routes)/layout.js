import Navbar from "../../components/LandingPage/LandingPageNavbar";
import Footer from "../../components/LandingPage/Footer";

export default function RootLayout({ children }) {
    return (
      
          <div>
            <Navbar />
             {children}
             <Footer />
          </div>
         
         
        
    );
  }