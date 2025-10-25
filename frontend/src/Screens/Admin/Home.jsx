import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import Student from "./Student";
import Faculty from "./Faculty";
import Subjects from "./Subject";
import Admin from "./Admin";
import Branch from "./Branch";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Profile from "./Profile";
import Exam from "../Exam";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: Profile },
  { id: "student", label: "Student", component: Student },
  { id: "faculty", label: "Faculty", component: Faculty },
  { id: "branch", label: "Branch", component: Branch },
  { id: "notice", label: "Notice", component: Notice },
  { id: "exam", label: "Exam", component: Exam },
  { id: "subjects", label: "Subjects", component: Subjects },
  { id: "admin", label: "Admin", component: Admin },
];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");

  // 🔹 Fetch Admin Details
  const fetchUserDetails = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Loading admin details...");
    try {
      const response = await axiosWrapper.get(`/admin/my-details`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (response.data.success) {
        setProfileData(response.data.data);
        dispatch(setUserData(response.data.data));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error fetching admin details");
    } finally {
      setIsLoading(false);
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Handle URL-based Menu Sync
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location]);

  // 🔹 Menu Highlight Classes
  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu === menuId;
    return `
      w-full text-left px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all
      ${
        isSelected
          ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow"
          : "text-gray-700 hover:bg-blue-50"
      }
    `;
  };

  // 🔹 Menu Navigation
  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/admin?page=${menuId}`);
  };

  // 🔹 Page Content
  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
          Loading...
        </div>
      );

    const MenuItem = MENU_ITEMS.find(
      (item) => item.id === selectedMenu
    )?.component;

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    return MenuItem && <MenuItem />;
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="flex min-h-screen bg-[#f8faff]">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg border-r border-indigo-100 flex flex-col justify-between z-20">
          {/* Upper part */}
          <div className="flex flex-col items-center py-6 space-y-6">
            {/* Profile */}
            <div
              className="flex flex-col items-center text-center cursor-pointer"
              onClick={() => handleMenuClick("home")}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow">
                <User className="text-white w-7 h-7" />
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-800">
                {profileData?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">
                {profileData?.email || "admin@email.com"}
              </p>
            </div>

            {/* Menu */}
            <ul className="w-full px-4 space-y-1">
              {MENU_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className={getMenuItemClass(item.id)}
                  onClick={() => handleMenuClick(item.id)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Logo */}
          <div className="flex flex-col items-center py-4 border-t border-indigo-50">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <span className="text-indigo-600 font-semibold text-lg">
                StudentPulse
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 mt-0 p-6 transition-all duration-300">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-indigo-100 p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
