import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function MainLayout({ children }) {

    return (

        <div className="flex flex-col min-h-screen">

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow">

                {children}

            </main>

            {/* Footer */}
            <Footer />

        </div>
    );
}

export default MainLayout;