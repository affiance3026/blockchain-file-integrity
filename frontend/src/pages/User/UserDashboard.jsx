import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";
import SearchBox from "../../components/SearchBox";
const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Issued Documents");
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);

  // Confirm Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const menuItems = [
    "Issued Documents",
    "Requests",
    "Profile",
  ];

  // ================= FETCH DOCUMENTS =================

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const res = await API.get("/user/issued-documents");
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH REQUESTS =================

  const fetchRequests = async () => {
    try {
      const res = await API.get("/user/access-requests");
      setRequests(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setRequestDetailsOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setRequestDetailsOpen(false);
  };

  // ================= FETCH PROFILE =================

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setProfile(res.data.data || null);
    } catch (error) {
      console.error(error);
    }
  };
  // Update Password
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await API.put("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password updated successfully");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };



  // ================= DOWNLOAD DOCUMENT =================

  const handleDownload = (cid) => {
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    window.open(fileUrl, "_blank");
  };

  // ================= DETAILS MODAL =================

  const openDetailsModal = (certificate) => {
    setSelectedCertificate(certificate);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedCertificate(null);
    setDetailsModalOpen(false);
  };

  // ================= CONFIRM MODAL =================

  const openModal = (type, id = null) => {
    setModalType(type);
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalType("");
    setSelectedRequestId(null);
    setIsModalOpen(false);
  };

  // ================= APPROVE REQUEST =================

  const handleApprove = async () => {
    try {
      await API.put(`/user/approve-request/${selectedRequestId}`);
      toast.success("Approved successfully");
      fetchRequests();
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  // ================= REJECT REQUEST =================

  const handleReject = async () => {
    try {
      await API.put(`/user/reject-request/${selectedRequestId}`);
      toast.error("Rejected successfully");
      fetchRequests();
      closeModal();
    } catch (error) {
      console.error(error);
    }
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
    fetchDocuments();
    fetchRequests();
    fetchProfile();

    // eslint-disable-next-line
  }, []);

  // ================= RENDER CONTENT =================

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-lg text-gray-700 dark:text-white">
          Loading...
        </div>
      );
    }

    // ================= ISSUED DOCUMENTS =================
    const filteredDocuments = documents.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      return (
        item.institute_name?.toLowerCase().includes(q) ||
        item.id?.toLowerCase().includes(q) ||
        item.institute_id?.toLowerCase().includes(q) ||
        item.file_name?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "Issued Documents") {
      return (
        <div className="grid gap-6">
          {documents.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No documents found.
            </p>
          ) : (
            filteredDocuments.map((item) => (
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
                  {item.file_name}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.institute_name || "Institute Name"}
                </p>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={() => handleDownload(item.file_url)}
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-blue-600
                      text-white
                      hover:bg-blue-700
                      transition-all
                    "
                  >
                    View
                  </button>

                  <button
                    onClick={() => openDetailsModal(item)}
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-yellow-500
                      text-white
                      hover:bg-yellow-600
                      transition-all
                    "
                  >
                    More Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    // ================= REQUESTS =================
    const filteredRequests = requests.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      return (
        item.id?.toLowerCase().includes(q) ||
        item.verifier_name?.toLowerCase().includes(q) ||
        item.file_name?.toLowerCase().includes(q) ||
        item.verifier_id?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "Requests") {
      return (
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No access requests found.
            </p>
          ) : (
            filteredRequests.map((item) => (
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
                  {item.verifier_name}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {item.file_name}
                </p>
                
                {item.status === "pending" && (
                  <div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                    From: {new Date(item.from_time).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    To: {new Date(item.from_time).toLocaleString("en-IN")}
                  </p>
                  </div>
                )}

                <p
                  className={`mt-2 font-medium ${
                    item.status === "approved"
                      ? "text-green-600 dark:text-green-400"
                      : item.status === "pending"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : item.status === "rejected"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-700 dark:text-white"
                  }`}
                >
                  Status:{" "}
                  {item.status
                    ? item.status.charAt(0).toUpperCase() +
                      item.status.slice(1)
                    : "Pending"}
                </p>

                <div className="flex gap-4 mt-3 flex-wrap">
                          

                  {item.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          openModal("approve", item.id)
                        }
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
                        onClick={() =>
                          openModal("reject", item.id)
                        }
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
                    </>
                  )}

                  <button
                    onClick={() => openRequestDetails(item)}
                    className="
                      px-5
                      py-2
                      rounded-xl
                      bg-yellow-500
                      text-white
                      hover:bg-yellow-600
                      transition-all
                    "
                  >
                    More Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    // ================= PROFILE =================

    if (activeTab === "Profile") {
      return (
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
            p-8
          "
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            User Profile
          </h2>

          <div className="space-y-4 mt-6">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>ID:</strong> {profile?.id}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Name:</strong> {profile?.name}
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> {profile?.email}
            </p>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="mt-6 px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Update Password
            </button>

            {showPasswordForm && (
              <div className="mt-6 space-y-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    bg-white
                    dark:bg-gray-900
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                    placeholder:text-gray-500
                    dark:placeholder:text-gray-400
                  "
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    bg-white
                    dark:bg-gray-900
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                    placeholder:text-gray-500
                    dark:placeholder:text-gray-400
                  "
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    outline-none
                    bg-white
                    dark:bg-gray-900
                    border-gray-300
                    dark:border-gray-700
                    text-gray-900
                    dark:text-white
                    placeholder:text-gray-500
                    dark:placeholder:text-gray-400
                  "
                />

                <button
                  onClick={handleUpdatePassword}
                  className="w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Save Password
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <div className="flex bg-gray-100 dark:bg-[#050816]">
        <Sidebar
          title="User Panel"
          menuItems={menuItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => openModal("logout")}
        />

        <div className="flex-1 p-8 ml-[280px] h-screen overflow-y-auto">
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
                Manage your certificates, access requests and profile
              </p>
              {activeTab !== "Profile" && (
                <SearchBox
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search"
                />
              )}
            </div>
          </div>

          {renderContent()}
        </div>

        <ConfirmModal
          isOpen={isModalOpen}
          title={
            modalType === "approve"
              ? "Approve Access Request"
              : modalType === "reject"
              ? "Reject Access Request"
              : "Logout"
          }
          message={
            modalType === "approve"
              ? "Are you sure you want to approve this request?"
              : modalType === "reject"
              ? "Are you sure you want to reject this request?"
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

      {/* DETAILS MODAL */}

      {detailsModalOpen && selectedCertificate && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            backdrop-blur-sm
            px-4
          "
        >
          <div
            className="
              w-full
              max-w-lg
              rounded-3xl
              border
              bg-white/90
              dark:bg-[#0B1120]/90
              border-gray-200
              dark:border-white/10
              backdrop-blur-2xl
              shadow-2xl
              p-8
            "
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Certificate Details
            </h2>

            <div className="space-y-4 mt-6 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Institute Name:</strong>{" "}
                {selectedCertificate.institute_name}
              </p>

              <p>
                <strong>File Name:</strong>{" "}
                {selectedCertificate.file_name}
              </p>

              <p>
                <strong>Certificate ID:</strong>{" "}
                {selectedCertificate.id}
              </p>

              <p>
                <strong>Institute ID:</strong>{" "}
                {selectedCertificate.institute_id}
              </p>

              <p>
                <strong>Institute Email:</strong>{" "}
                {selectedCertificate.institute_email}
              </p>
            </div>

            <button
              onClick={closeDetailsModal}
              className="
                mt-8
                w-full
                py-3
                rounded-2xl
                bg-blue-600
                text-white
                hover:bg-blue-700
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
      {requestDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border bg-white/90 dark:bg-[#0B1120]/90 border-gray-200 dark:border-white/10 backdrop-blur-2xl shadow-2xl p-8">

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Request Details
            </h2>

            <div className="space-y-5 mt-6 text-gray-700 dark:text-gray-300">

              <div>
                <h3 className="font-semibold text-lg">Verifier Details</h3>

                <p><strong>Name:</strong> {selectedRequest.verifier_name}</p>
                <p><strong>ID:</strong> {selectedRequest.verifier_id}</p>
                <p><strong>Email:</strong> {selectedRequest.verifier_email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Certificate Details</h3>

                <p><strong>Certificate:</strong> {selectedRequest.file_name}</p>
                <p><strong>Certificate ID:</strong> {selectedRequest.certificate_id}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">Request Details</h3>

                <p><strong>Request ID:</strong> {selectedRequest.id}</p>
                <p><strong>Status:</strong> {selectedRequest.status.charAt(0).toUpperCase()+selectedRequest.status.slice(1)}</p>
                <p>
                  <strong>Access From:</strong>{" "}
                  {new Date(selectedRequest.from_time).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Access To:</strong>{" "}
                  {new Date(selectedRequest.to_time).toLocaleString("en-IN")}
                </p>
              </div>

            </div>

            <button
              onClick={closeRequestDetails}
              className="mt-8 w-full py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDashboard;