import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SearchBox from "../../components/SearchBox";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Raise Request");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // Raise Request
  const [certificateId, setCertificateId] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // Certificate Fetch
  const [certificateVerified, setCertificateVerified] = useState(false);
  const [certificateChecking, setCertificateChecking] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState(null);

  // Verify Upload
  const [verifyFile, setVerifyFile] = useState(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const menuItems = [
    "Raise Request",
    "My Requests",
    "Profile",
  ];

  // ================= FILE VALIDATION =================

  const validateFile = (file) => {
    if (!file) return false;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, PNG, JPG, JPEG, DOCX files are allowed");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  // ================= FETCH CERTIFICATE DETAILS =================

  const fetchCertificateDetails = async () => {
    if (!certificateId) {
      toast.error("Please enter Certificate ID");
      return;
    }

    try {
      setCertificateChecking(true);

      const res = await API.get(
        `/verifier/check-certificate/${certificateId}`
      );

      setCertificateVerified(true);
      setCertificateDetails(res.data.data);

      toast.success(res.data.message);
    } catch (error) {
      console.error(error);

      setCertificateVerified(false);
      setCertificateDetails(null);

      toast.error(
        error?.response?.data?.message ||
          "Certificate not found"
      );
    } finally {
      setCertificateChecking(false);
    }
  };

  // ================= FETCH REQUESTS =================

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const res = await API.get("/verifier/my-requests");
      setRequests(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= DETAILS MODAL =================

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
    setDetailsModalOpen(false);
  };

  // ================= FETCH PROFILE =================

  const fetchProfile = async () => {
    try {
      const res = await API.get("/verifier/profile");
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


  // ================= RAISE ACCESS REQUEST =================

  const handleRaiseRequest = async (e) => {
    e.preventDefault();

    if (!certificateVerified || !certificateDetails) {
      toast.error("Please fetch valid certificate first");
      return;
    }

    if (!fromTime || !toTime) {
      toast.error("Please select from and to time");
      return;
    }

    if (fromTime >= toTime) {
      toast.error("From time must be before To time");
      return;
    }

    try {
      const res = await API.post("/verifier/request-access", {
        certificate_id: certificateId,
        user_id: certificateDetails.user_id,
        from_time: fromTime,
        to_time: toTime,
      });

      toast.success(res.data.message);

      setCertificateId("");
      setFromTime("");
      setToTime("");
      setCertificateVerified(false);
      setCertificateDetails(null);

      fetchRequests();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to raise access request"
      );
    }
  };

  // ================= VERIFY CERTIFICATE =================

  const handleVerifyCertificate = async () => {
    if (!selectedCertificateId || !verifyFile) {
      toast.error("Please upload certificate file");
      return;
    }

    if (!validateFile(verifyFile)) return;

    try {
      setVerifyLoading(true);
      const formData = new FormData();
      formData.append("certificate_id", selectedCertificateId);
      formData.append("file", verifyFile);

      const res = await API.post(
        "/verifier/verify-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(res.data.status);

      setVerifyFile(null);
      setSelectedCertificateId("");
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.status ||
          "Verification failed"
      );
    }finally {
    setVerifyLoading(false);
  }
  };

  // ================= MODAL =================

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalType("");
    setIsModalOpen(false);
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

  const handleConfirm = () => {
    if (modalType === "logout") {
      handleLogout();
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchProfile();

    // eslint-disable-next-line
  }, []);

  // ================= RENDER =================

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-lg text-gray-700 dark:text-white">
          Loading...
        </div>
      );
    }

    // ================= RAISE REQUEST =================

    if (activeTab === "Raise Request") {
      return (
        <form
          onSubmit={handleRaiseRequest}
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
            space-y-5
          "
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Raise Access Request
          </h2>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Certificate ID"
              value={certificateId}
              onChange={(e) => {
                setCertificateId(e.target.value);
                setCertificateVerified(false);
                setCertificateDetails(null);
              }}
              className="
                flex-1
                px-4
                py-3
                rounded-xl
                border
                bg-white
                dark:bg-white/5
                border-gray-300
                dark:border-gray-700
                text-gray-900
                dark:text-white
                placeholder:text-gray-500
                dark:placeholder:text-gray-400
              "
            />

            <button
              type="button"
              onClick={fetchCertificateDetails}
              className="
                px-6
                py-3
                rounded-xl
                bg-blue-600
                text-white
                hover:bg-blue-700
              "
            >
              {certificateChecking ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {certificateVerified && certificateDetails && (
            <>
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  dark:border-white/10
                  bg-white/60
                  dark:bg-white/5
                  p-5
                "
              >
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Certificate Name:</strong>{" "}
                  {certificateDetails.file_name}
                </p>

                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  <strong>User Name:</strong>{" "}
                  {certificateDetails.user_name}
                </p>

                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  <strong>User ID:</strong>{" "}
                  {certificateDetails.user_id}
                </p>

                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  <strong>Institute Name:</strong>{" "}
                  {certificateDetails.institute_name}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <label className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    Select From Date
                  </label>
                  <input
                    type="datetime-local"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    onFocus={(e) => e.target.showPicker?.()}
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      bg-white
                      dark:bg-white/5
                      border-gray-300
                      dark:border-gray-700
                      text-gray-900
                      dark:text-white
                      dark:[color-scheme:dark]
                    "
                  />
                </div>



                <div className="relative w-1/2">
                  <label className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                    Select To Date
                  </label>
                  <input
                    type="datetime-local"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    onFocus={(e) => e.target.showPicker?.()}
                    className="
                      w-full
                      px-4
                      py-3
                      rounded-xl
                      border
                      bg-white
                      dark:bg-white/5
                      border-gray-300
                      dark:border-gray-700
                      text-gray-900
                      dark:text-white
                      dark:[color-scheme:dark]
                    "
                  />
                </div>
              </div>

              
              <button
                type="submit"
                className="
                  w-full
                  py-3
                  rounded-xl
                  bg-blue-600
                  text-white
                  font-medium
                  hover:bg-blue-700
                "
              >
                Raise Request
              </button>
            </>
          )}
        </form>
      );
    }

    // ================= MY REQUESTS =================
    const filteredRequests = requests.filter((item) => {
      const q = searchQuery.toLowerCase().trim();

      return (
        item.id?.toLowerCase().includes(q) ||
        item.user_name?.toLowerCase().includes(q) ||
        item.user_id?.toLowerCase().includes(q) ||
        item.file_name?.toLowerCase().includes(q) ||
        item.certificate_id?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "My Requests") {
      return (
        <div className="grid gap-6">
          {requests.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No requests found.
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
                  Certificate ID: {item.certificate_id}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  User Name: {item.user_name}
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Certificate Name: {item.file_name}
                </p>

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

                {item.status === "approved" &&
                  new Date() >= new Date(item.from_time) &&
                  new Date() <= new Date(item.to_time) && (
                  <div className="mt-6">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Attach certificate file below
                    </p>

                    <label
                      className="
                        mt-4
                        flex
                        items-center
                        justify-center
                        px-6
                        py-4
                        rounded-2xl
                        border
                        border-dashed
                        border-gray-300
                        dark:border-gray-600
                        cursor-pointer
                        bg-white
                        dark:bg-white/5
                        hover:bg-blue-50
                        dark:hover:bg-white/10
                        transition-all
                      "
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {verifyFile
                          ? verifyFile.name
                          : "Choose Certificate File"}
                      </span>

                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          setVerifyFile(e.target.files[0]);
                          setSelectedCertificateId(
                            item.certificate_id
                          );
                        }}
                      />
                    </label>

                    <button
                      onClick={handleVerifyCertificate}
                      disabled={verifyLoading}
                      className={`
                        mt-4
                        px-6
                        py-3
                        rounded-xl
                        text-white
                        transition-all
                        ${
                          verifyLoading
                            ? "bg-green-400 cursor-not-allowed opacity-70"
                            : "bg-green-600 hover:bg-green-700"
                        }
                      `}
                    >
                      {verifyLoading ? "Verifying..." : "Upload & Verify"}
                    </button>
                  </div>
                )}
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
            Verifier Profile
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
    <div className="flex bg-gray-100 dark:bg-[#050816]">
      <Sidebar
        title="Verifier Panel"
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
              Manage certificate verification and access requests
            </p>
              {activeTab === "My Requests" && (
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
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />

      {/* DETAILS MODAL */}

      {detailsModalOpen && selectedRequest && (
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
              Request Details
            </h2>

            <div className="space-y-5 mt-6 text-gray-700 dark:text-gray-300">

              <div>
                <h3 className="font-semibold text-lg">
                  Request Details
                </h3>

                <p>
                  <strong>Request ID:</strong>{" "}
                  {selectedRequest.id}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedRequest.status.charAt(0).toUpperCase()+selectedRequest.status.slice(1)}
                </p>

                <p>
                  <strong>Access From:</strong>{" "}
                  {new Date(selectedRequest.from_time).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Access To:</strong>{" "}
                  {new Date(selectedRequest.to_time).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Certificate Details
                </h3>

                <p>
                  <strong>Certificate Name:</strong>{" "}
                  {selectedRequest.file_name}
                </p>

                <p>
                  <strong>Certificate ID:</strong>{" "}
                  {selectedRequest.certificate_id}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  User Details
                </h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedRequest.user_name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedRequest.user_email}
                </p>

                <p>
                  <strong>User ID:</strong>{" "}
                  {selectedRequest.user_id}
                </p>
              </div>

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
    </div>
  );
};

export default VerifierDashboard;