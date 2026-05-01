import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import ConfirmModal from "../../components/ConfirmModal";
import { useRef } from "react";
const InstituteDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userVerified, setUserVerified] = useState(false);
  const [userChecking, setUserChecking] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const fileInputRef = useRef(null);

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
      localStorage.clear();
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
                <option value="">Select Certificate Type</option>

                <option value="10th Marksheet">10th Marksheet</option>
                <option value="12th Marksheet">12th Marksheet</option>

                <option value="Degree Certificate - Sem 1">Degree Certificate - Sem 1</option>
                <option value="Degree Certificate - Sem 2">Degree Certificate - Sem 2</option>
                <option value="Degree Certificate - Sem 3">Degree Certificate - Sem 3</option>
                <option value="Degree Certificate - Sem 4">Degree Certificate - Sem 4</option>
                <option value="Degree Certificate - Sem 5">Degree Certificate - Sem 5</option>
                <option value="Degree Certificate - Sem 6">Degree Certificate - Sem 6</option>

                <option value="Provisional Degree Certificate">Provisional Degree Certificate</option>
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

    if (activeTab === "Issued Certificates") {
      return (
        <div className="grid gap-6">
          {issuedCertificates.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No certificates issued yet.
            </p>
          ) : (
            issuedCertificates.map((item) => (
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
                  User ID: {item.user_id}
                </p>

                
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

            
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-[#050816]">
      <Sidebar
        title="Institute Panel"
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => openModal("logout")}
      />

      <div className="flex-1 p-8">
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

          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage institute approval and certificate issuing workflow
          </p>
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
    </div>
  );
};

export default InstituteDashboard;