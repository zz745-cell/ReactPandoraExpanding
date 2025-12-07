import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../store";

function Layout() {
  const flashMessage = useSelector((state) => state.flashMessage);
  const dispatch = useDispatch();
  
    const handleFlashClose = () => {
      dispatch(actions.setFlashMessage(null));
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 inset-x-0 z-50">
          <Navbar />
        </div>

        {flashMessage && (
          <FlashMessage message={flashMessage} onClose={handleFlashClose} />
        )}

        <main className="pt-24">
          <Outlet />
        </main>
      </div>
    );
  }
  
  export default Layout;
  