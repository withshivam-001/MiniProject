import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import Notice from "../Notice";
import { useDispatch } from "react-redux";
import { setUserData } from "../../redux/actions";
import axiosWrapper from "../../utils/AxiosWrapper";
import Timetable from "./Timetable";
import Material from "./Material";
import Profile from "./Profile";
import Exam from "../Exam";
import ViewMarks from "./ViewMarks";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";

const MENU_ITEMS = [
  { id: "home", label: "Home", component: null },
  { id: "timetable", label: "Timetable", component: Timetable },
  { id: "material", label: "Material", component: Material },
  { id: "notice", label: "Notice", component: Notice },
  { id: "exam", label: "Exam", component: Exam },
  { id: "marks", label: "Marks", component: ViewMarks },
];

const Home = () => {
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [profileData, setProfileData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userToken = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Fetch User Details
  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/student/my-details`, {
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
      toast.error(
        error.response?.data?.message || "Error fetching user details"
      );
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [dispatch, userToken]);

  // 🔹 Menu Highlight Style
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

  // 🔹 Render Content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
          Loading...
        </div>
      );
    }

    if (selectedMenu === "home" && profileData) {
      return <Profile profileData={profileData} />;
    }

    const MenuItem = MENU_ITEMS.find(
      (item) => item.id === selectedMenu
    )?.component;

    return MenuItem && <MenuItem />;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const page = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === page);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location]);

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/student?page=${menuId}`);
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="flex min-h-screen bg-[#f8faff]">
        {/* Sidebar */}
        <aside
          className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white shadow-lg border-r border-indigo-100 z-20 flex flex-col items-center py-6 space-y-6"
        >
          {/* Profile Section */}
          <div
            className="flex flex-col items-center text-center cursor-pointer"
            onClick={() => handleMenuClick("home")}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow">
              <User className="text-white w-7 h-7" />
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {profileData?.name || "Student Name"}
            </p>
            <p className="text-xs text-gray-500">
              {profileData?.email || "student@email.com"}
            </p>
          </div>

          {/* Menu List */}
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 mt-16 p-8 transition-all duration-300">
          {selectedMenu === "home" && (
            <div className="text-center text-gray-800 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600">
                Welcome to Your College ERP Dashboard
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
                Access your timetable, materials, notices, exams, and marks — all in one place.
              </p>
            </div>
          )}

          {/* Page Container */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-indigo-100 p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
