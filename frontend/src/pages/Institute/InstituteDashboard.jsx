import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SearchBox from "../../components/SearchBox";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";
import { useRef } from "react";
const InstituteDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userVerified, setUserVerified] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [userChecking, setUserChecking] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const fileInputRef = useRef(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [fileName, setFileName] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [activeTab, setActiveTab] = useState("Issue Certificate");
  const [loading, setLoading] = useState(false);
 
  const [profile, setProfile] = useState(null);
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  

  const [approvalFile, setApprovalFile] = useState(null);
  const [issueLoading, setIssueLoading] = useState(false);
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");

  const menuItems = [
    "Issue Certificate",
    "Issued Certificates",
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
      alert("Only PDF, PNG, JPG, JPEG, DOCX files are allowed");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return false;
    }

    return true;
  };
  
  const fetchUserDetails = async () => {
    if (!userId) {
      toast.error("Please enter User ID");
      return;
    }

    try {
      setUserChecking(true);

      const res = await API.get(
        `/institute/check-user/${userId}`
      );

      setUserVerified(true);
      setUserDetails(res.data.data);

      toast.success(res.data.message);
    } catch (error) {
      console.error(error);

      setUserVerified(false);
      setUserDetails(null);

      toast.error(
        error?.response?.data?.message ||
          "User not found"
      );
    } finally {
      setUserChecking(false);
    }
  };
  // ================= FETCH PROFILE =================

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await API.get("/institute/profile");
      setProfile(res.data.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH ISSUED CERTIFICATES =================

  const fetchIssuedCertificates = async () => {
    try {
      const res = await API.get("/institute/issued-certificates");
      setIssuedCertificates(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
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

  // ================= RAISE APPROVAL REQUEST =================

  const handleRaiseApproval = async () => {
    if (!approvalFile) {
      toast.error("Please upload verification document");
      return;
    }

    if (!validateFile(approvalFile)) return;

    try {
      const formData = new FormData();
      formData.append("file", approvalFile);
      setApprovalLoading(true);
      await API.put(
        "/institute/raise-approval",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchProfile();
      closeModal();
      setApprovalFile(null);
      toast.success("Request raised successfully");
    } catch (error) {
      console.error(error);
      toast.error(
      error?.response?.data?.message ||
      "Unable to raise request"
      );
    }finally{
      setApprovalLoading(false);
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
  // View Certificate
  const handleDownload = (cid) => {
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
    window.open(fileUrl, "_blank");
  };
  // ================= ISSUE CERTIFICATE =================

  const handleIssueCertificate = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please enter User ID");
      return;
    }

    if (!certificateFile) {
      toast.error("Please upload certificate file");
      return;
    }
    if (!fileName) {
      toast.error("Please select certificate type");
      return;
    }
    if (!validateFile(certificateFile)) return;
    
    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("file", certificateFile);
      formData.append("file_name", fileName);
      setIssueLoading(true);
      await API.post(
        "/institute/issue-certificate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUserId("");
      setUserVerified(false);
      setUserDetails(null);
      setCertificateFile(null);
      setFileName("");


      fetchIssuedCertificates();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Certificate issued successfully");

    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to issue certificate"
      );
    }finally{
      setIssueLoading(false);
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

  const handleConfirm = () => {
    

    if (modalType === "logout") {
      toast.success("Logout successfull");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      navigate("/");
      closeModal();
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchIssuedCertificates();

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

    // ================= ISSUE CERTIFICATE =================

    if (activeTab === "Issue Certificate") {
      if (profile?.status !== "approved") {
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
              Institute Approval Required
            </h2>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Your institute is not approved yet.
              Please raise approval request first.
            </p>

            <p
              className={`mt-3 font-medium ${
                profile?.status === "pending"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : profile?.status === "rejected"
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              Current Status:{" "}
              {profile?.status
                ? profile.status.charAt(0).toUpperCase() +
                  profile.status.slice(1)
                : "Not Raised"}
            </p>

            <p className="mt-5 text-gray-700 dark:text-gray-300 font-medium">
              Attach your file below
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
                {approvalFile
                  ? approvalFile.name
                  : "Choose Verification File"}
              </span>

              <input
                type="file"
                hidden
                onChange={(e) =>
                  setApprovalFile(e.target.files[0])
                }
              />
            </label>

            <button
              onClick={handleRaiseApproval}
              disabled={approvalLoading}
              className={`
                mt-6
                px-6
                py-3
                rounded-2xl
                text-white
                font-medium
                transition-all
                ${approvalLoading 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"}
              `}
            >
              {approvalLoading
                ? "Processing..."
                : "Raise Approval Request"}
            </button>
          </div>
        );
      }

      return (
        <form
          onSubmit={handleIssueCertificate}
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
            Issue Certificate
          </h2>

          {/* USER ID + FETCH BUTTON */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setUserVerified(false);
                setUserDetails(null);
              }}
              required
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
              onClick={fetchUserDetails}
              className="
                px-6
                py-3
                rounded-xl
                bg-blue-600
                text-white
                hover:bg-blue-700
                transition-all
              "
            >
              {userChecking ? "Fetching..." : "Fetch"}
            </button>
          </div>

          {/* SHOW ONLY AFTER USER FOUND */}
          {userVerified && userDetails && (
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
                  <strong>Name:</strong> {userDetails.name}
                </p>

                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> {userDetails.email}
                </p>
              </div>

              <select
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
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
                "
              >
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="">Select Certificate Type</option>

                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="10th Marksheet">10th Marksheet</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="12th Marksheet">12th Marksheet</option>

                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 1">Degree Certificate - Sem 1</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 2">Degree Certificate - Sem 2</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 3">Degree Certificate - Sem 3</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 4">Degree Certificate - Sem 4</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 5">Degree Certificate - Sem 5</option>
                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Degree Certificate - Sem 6">Degree Certificate - Sem 6</option>

                <option className="bg-white text-black dark:bg-gray-800 dark:text-white" value="Provisional Degree Certificate">Provisional Degree Certificate</option>
              </select>

              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Attach certificate file below
              </p>

              <label
                className="
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
                  {certificateFile
                    ? certificateFile.name
                    : "Choose Certificate File"}
                </span>

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setCertificateFile(file);

                    
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={issueLoading}
                className={`
                  w-full
                  py-3
                  rounded-xl
                  text-white
                  font-medium
                  transition-all
                  ${issueLoading 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"}
                `}
              >
                {issueLoading
                  ? "Issuing..."
                  : "Issue Certificate"}
              </button>
            </>
          )}
        </form>
      );
    }

    // ================= ISSUED CERTIFICATES =================
    const filteredCertificates = issuedCertificates.filter((item) => {
      const q = searchQuery.toLowerCase();

      return (
        item.id?.toLowerCase().includes(q) ||
        item.user_id?.toLowerCase().includes(q) ||
        item.user_name?.toLowerCase().includes(q) ||
        item.user_email?.toLowerCase().includes(q) ||
        item.file_name?.toLowerCase().includes(q)
      );
    });
    if (activeTab === "Issued Certificates") {
      return (
        <div className="grid gap-6">
          {issuedCertificates.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No certificates issued yet.
            </p>
          ) : (
            filteredCertificates.map((item) => (
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
                  Certificate ID: {item.id}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Certificate Name: {item.file_name}
                </p>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Certificate Holder: {item.user_name}
                </p>

                <div className="flex gap-4 mt-3 flex-wrap">
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
            Institute Profile
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

            <p className="text-gray-700 dark:text-gray-300">
              <strong>Status:</strong>{" "}
              {profile?.status
              ? profile.status.charAt(0).toUpperCase() +
                profile.status.slice(1)
              : "Not Raised"}
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
        title="Institute Panel"
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
              Manage institute approval and certificate issuing workflow
            </p>
            {activeTab === "Issued Certificates" && (
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

            <div className="space-y-5 mt-6 text-gray-700 dark:text-gray-300">

              <div>
                <h3 className="font-semibold text-lg">
                  User Details
                </h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedCertificate.user_name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedCertificate.user_email}
                </p>

                <p>
                  <strong>User ID:</strong>{" "}
                  {selectedCertificate.user_id}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Certificate Details
                </h3>

                <p>
                  <strong>Certificate Name:</strong>{" "}
                  {selectedCertificate.file_name}
                </p>

                <p>
                  <strong>Certificate ID:</strong>{" "}
                  {selectedCertificate.id}
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

export default InstituteDashboard;