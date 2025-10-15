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

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      toast.loading("Loading user details...");
      const response = await axiosWrapper.get(`/student/my-details`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
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

  const getMenuItemClass = (menuId) => {
    const isSelected = selectedMenu.toLowerCase() === menuId.toLowerCase();
    return `
      flex-1 text-center px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer
      font-medium text-sm sm:text-base rounded-full transition-all duration-300 ease-in-out
      ${
        isSelected
          ? "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-lg transform scale-105"
          : "bg-white/60 text-blue-800 hover:bg-blue-50 hover:shadow"
      }
    `;
  };

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
      (item) => item.label.toLowerCase() === selectedMenu.toLowerCase()
    )?.component;

    return MenuItem && <MenuItem />;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const pathMenuId = urlParams.get("page") || "home";
    const validMenu = MENU_ITEMS.find((item) => item.id === pathMenuId);
    setSelectedMenu(validMenu ? validMenu.id : "home");
  }, [location.pathname]);

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
    navigate(`/student?page=${menuId}`);
  };

  return (
    <>
      <Navbar />
      {/* Background Section */}
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-700/60 to-blue-500/50 backdrop-blur-sm"></div>

        {/* Content Wrapper */}
        <div className="relative z-10">
          {/* Menu Bar */}
          <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-lg border-b border-blue-100 shadow-md">
            <ul className="flex flex-wrap justify-center sm:justify-evenly items-center gap-3 sm:gap-6 w-full max-w-6xl mx-auto py-4 px-3">
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

          {/* Hero Section for Home */}
          {selectedMenu === "home" && (
            <div className="text-center text-white mt-12 sm:mt-16 px-6">
              <h1 className="text-3xl sm:text-5xl font-bold drop-shadow-lg">
                Welcome to Your College ERP Dashboard
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                Access your timetable, materials, notices, exams, and marks —
                all in one place.
              </p>
            </div>
          )}

          {/* Page Content */}
          <div className="max-w-6xl mx-auto mt-10 sm:mt-14 px-4 sm:px-8 pb-16">
            <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-2xl p-5 sm:p-8 border border-blue-100 transition-all duration-300">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
};

export default Home;
