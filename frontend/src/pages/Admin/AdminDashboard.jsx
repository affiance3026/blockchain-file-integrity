import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";
import SearchBox from "../../components/SearchBox";
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [pendingInstitutes, setPendingInstitutes] = useState([]);
  const [approvedInstitutes, setApprovedInstitutes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedInstituteId, setSelectedInstituteId] = useState(null);

  const menuItems = [
    "Pending Requests",
    "Approved Institutes",
  ];

  // ================= FETCH PENDING INSTITUTES =================

  const fetchPendingInstitutes = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/pending-institutes");

      setPendingInstitutes(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH APPROVED INSTITUTES =================

  const fetchApprovedInstitutes = async () => {
    try {
      setLoading(true);

      const res = await API.get("/admin/approved-institutes");

      setApprovedInstitutes(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= MODAL =================

  const openModal = (type, id = null) => {
    setModalType(type);
    setSelectedInstituteId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalType("");
    setSelectedInstituteId(null);
    setIsModalOpen(false);
  };

  // ================= APPROVE =================

  const handleApprove = async () => {
    try {
      await API.put(`/admin/approve/${selectedInstituteId}`);

      fetchPendingInstitutes();
      fetchApprovedInstitutes();
      toast.success("Institute approved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve institute");
    }

    closeModal();
  };

  // ================= REJECT =================

  const handleReject = async () => {
    try {
      await API.put(`/admin/reject/${selectedInstituteId}`);

      fetchPendingInstitutes();
      toast.error("Institute rejected successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject institute");
    }

    closeModal();
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    toast.success("Logout successfull");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/");
    closeModal();
  };

  // ================= CONFIRM ACTION =================

  const handleConfirm = () => {
    if (modalType === "approve") {
      handleApprove();
    }

    if (modalType === "reject") {
      handleReject();
    }

    if (modalType === "logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    fetchPendingInstitutes();
    fetchApprovedInstitutes();

    // eslint-disable-next-line
  }, []);

  // ================= RENDER CONTENT =================

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-gray-700 dark:text-white text-lg">
          Loading...
        </div>
      );
    }

    // ================= PENDING =================
    const filteredPending = pendingInstitutes.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      return (
        item.name?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "Pending Requests") {
      return (
        <div className="grid gap-6">
          {pendingInstitutes.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No pending institute requests.
            </p>
          ) : (
            filteredPending.map((item) => (
              <div
                key={item._id}
                className="
                  rounded-3xl
                  border
                  bg-white/70
                  dark:bg-white/5
                  border-gray-200
                  dark:border-white/10
                  backdrop-blur-2xl
                  shadow-xl
                  p-6
                "
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.email}
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Institute ID: {item.id}
                </p>

                <p
                  className={`mt-2 text-sm font-medium ${
                    item.status === "pending"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : item.status === "rejected"
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  Status:{" "}
                  {item.status
                    ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                    : "Not Raised"}
                </p>
                
                {item.cid && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://gateway.pinata.cloud/ipfs/${item.cid}`,
                        "_blank"
                      )
                    }
                    className="
                      mt-4
                      px-5
                      py-2
                      rounded-xl
                      bg-blue-600
                      text-white
                      hover:bg-blue-700
                      transition-all
                    "
                  >
                    View Document
                  </button>
                )}


                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => openModal("approve", item.id)}
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-green-600
                      text-white
                      hover:bg-green-700
                      transition-all
                    "
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => openModal("reject", item.id)}
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-red-600
                      text-white
                      hover:bg-red-700
                      transition-all
                    "
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    // ================= APPROVED =================
    const filteredApproved = approvedInstitutes.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      return (
        item.name?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "Approved Institutes") {
      return (
        <div className="grid gap-6">
          {approvedInstitutes.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No approved institutes found.
            </p>
          ) : (
            filteredApproved.map((item) => (
              <div
                key={item._id}
                className="
                  rounded-3xl
                  border
                  bg-white/70
                  dark:bg-white/5
                  border-gray-200
                  dark:border-white/10
                  backdrop-blur-2xl
                  shadow-xl
                  p-6
                "
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.email}
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Institute ID: {item.id}
                </p>
              </div>
            ))
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex bg-gray-100 dark:bg-[#050816]">
      <Sidebar
        title="Admin Panel"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => openModal("logout")}
      />

      <div className="flex-1 p-8 ml-[280px] h-screen overflow-y-auto">
        {/* Top Section */}
        <div
          className="
            rounded-3xl
            border
            bg-white/70
            dark:bg-white/5
            border-gray-200
            dark:border-white/10
            backdrop-blur-2xl
            shadow-xl
            p-6
            mb-8
          "
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {activeTab}
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage institute approvals and verification flow
            </p>
              <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search"
            />
          </div>
        </div>

        {renderContent()}
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title={
          modalType === "approve"
            ? "Approve Institute"
            : modalType === "reject"
            ? "Reject Institute"
            : "Logout"
        }
        message={
          modalType === "approve"
            ? "Are you sure you want to approve this institute?"
            : modalType === "reject"
            ? "Are you sure you want to reject this institute?"
            : "Are you sure you want to logout?"
        }
        confirmText={
          modalType === "approve"
            ? "Approve"
            : modalType === "reject"
            ? "Reject"
            : "Logout"
        }
        confirmColor={
          modalType === "approve"
            ? "bg-green-600 hover:bg-green-700"
            : modalType === "reject"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-red-600 hover:bg-red-700"
        }
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default AdminDashboard;