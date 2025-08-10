import React, { useState } from "react";
import UserHeader from "../../userModule/userComponents/UserHeader";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AppState } from "../../store/storeTypes";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL =
  "https://iqtelephony.airtel.in/gateway/airtel-xchange/v2/execute/workflow";

const COLORS = {
  CARD_1: "#e6f0ff",
  CARD_2: "#fff2cc",
  CARD_3: "#e6ffec",
};

const VIDEOS = [
  {
    id: "jqI5myb9qCM",
    title: "Telugu Support Guide",
    language: "Telugu",
    thumbnail: "https://img.youtube.com/vi/jqI5myb9qCM/maxresdefault.jpg",
  },
  {
    id: "ibCUNjQ5BA8",
    title: "Hindi Support Guide", 
    language: "Hindi",
    thumbnail: "https://img.youtube.com/vi/ibCUNjQ5BA8/maxresdefault.jpg",
  },
  {
    id: "S6mvxC0Gtno",
    title: "English Support Guide",
    language: "English", 
    thumbnail: "https://img.youtube.com/vi/S6mvxC0Gtno/maxresdefault.jpg",
  },
];

type CallOption = 1 | 2 | 3;

const CallCenter: React.FC = () => {
  const location = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Get mobile from Redux state
  const phoneNumber = useSelector(
    (state: AppState) => state.currentUserData?.mobile || ""
  );
  const currentUserData = useSelector(
    (state: AppState) => state.currentUserData || ""
  );
  console.log("currentUserData", currentUserData);

  const handleApiCall = async (option: CallOption) => {
    try {
      if (!phoneNumber) {
        alert("No phone number found. Please login or update your profile.");
        return;
      }

      const payload = {
        callFlowId:
          "TUMspyjWoYb+Ul8vp2khpgWZix3lECvaXcJtTQ78KKK6ZrDHJu7L4PH+3GpdB3h+NZote2LjQdUQy1S9rnLnpLO4EZ0yMMDdK9TZynTxHEU=",
        customerId: "KWIKTSP_CO_Td9yLftfU903GrIZNyxW",
        callType: "OUTBOUND",
        callFlowConfiguration: {
          initiateCall_1: {
            callerId: "8048248411",
            mergingStrategy: "SEQUENTIAL",
            participants: [
              {
                participantAddress: phoneNumber,
                callerId: "8048248411",
                participantName: "abc",
                maxRetries: 1,
                maxTime: 360,
              },
            ],
            maxTime: 360,
          },
          addParticipant_1: {
            mergingStrategy: "SEQUENTIAL",
            maxTime: 360,
            participants: [
              {
                participantAddress:
                  option === 1
                    ? "9052519059"
                    : option === 2
                    ? "9701646859"
                    : "9494999989",
                participantName: "pqr",
                maxRetries: 1,
                maxTime: 360,
              },
            ],
          },
        },
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: "Basic c21hcnRlcmJpejotaDcySj92MnZUWEsyV1J4",
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API call failed");
      await response.json();

      toast.success("Call Initiated. Please wait for the call to connect.");
    } catch (error) {
      toast.error("Call Initiated. error.");
      console.error("API call error:", error);
    }
  };

  const openVideo = (videoId: string) => {
    setSelectedVideo(videoId);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Responsive styles
  const containerStyle: React.CSSProperties = {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f5f5f5",
    padding: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    border: "2px solid #0033a0",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "90%",
    width: "100%",
    // maxWidth: "500px",
    marginTop: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "20px",
    color: "#0033a0",
    fontWeight: "bold",
    marginBottom: "24px",
  };

  const videoGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "0",
  };

  const videoCardStyle: React.CSSProperties = {
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    transition: "transform 0.2s ease",
  };

  const videoThumbnailStyle: React.CSSProperties = {
    width: "100%",
    height: "80px",
    objectFit: "cover",
    display: "block",
  };

  const videoInfoStyle: React.CSSProperties = {
    padding: "8px",
    textAlign: "center",
  };

  const videoLanguageStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#0033a0",
    margin: "0",
  };

  const optionBoxStyle = (bgColor: string): React.CSSProperties => ({
    backgroundColor: bgColor,
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  });

  const textWrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  const optionTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#0033a0",
    marginBottom: "4px",
  };

  const optionSubtitleStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#333",
    margin: 0,
  };

  const callIconStyle: React.CSSProperties = {
    fontSize: "22px",
    color: "#28a745",
  };

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  };

  const iframeContainerStyle: React.CSSProperties = {
    position: "relative",
    paddingBottom: "56.25%", // 16:9 aspect ratio
    height: 0,
    overflow: "hidden",
  };

  const iframeStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div style={containerStyle}>
      {location.pathname.includes("/user/contact-support") && (
        <UserHeader headerText="Call Center" />
      )}

      {/* Video Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Support Videos</div>
        <div style={videoGridStyle}>
          {VIDEOS.map((video) => (
            <div
              key={video.id}
              style={videoCardStyle}
              onClick={() => openVideo(video.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                style={videoThumbnailStyle}
              />
              <div style={videoInfoStyle}>
                <p style={videoLanguageStyle}>{video.language}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call Options Section */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Call Options</div>

        <div
          style={optionBoxStyle(COLORS.CARD_1)}
          onClick={() => handleApiCall(1)}
        >
          <div style={textWrapperStyle}>
            <div style={optionTitleStyle}>Call Option 1</div>
            <p style={optionSubtitleStyle}>Customer Support</p>
          </div>
          <span style={callIconStyle}>📞</span>
        </div>

        <div
          style={optionBoxStyle(COLORS.CARD_2)}
          onClick={() => handleApiCall(2)}
        >
          <div style={textWrapperStyle}>
            <div style={optionTitleStyle}>Call Option 2</div>
            <p style={optionSubtitleStyle}>Technical Support</p>
          </div>
          <span style={callIconStyle}>📞</span>
        </div>

        <div
          style={optionBoxStyle(COLORS.CARD_3)}
          onClick={() => handleApiCall(3)}
        >
          <div style={textWrapperStyle}>
            <div style={optionTitleStyle}>Call Option 3</div>
            <p style={optionSubtitleStyle}>General Inquiry</p>
          </div>
          <span style={callIconStyle}>📞</span>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div style={modalStyle} onClick={closeVideo}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button style={closeButtonStyle} onClick={closeVideo}>
              ×
            </button>
            <div style={iframeContainerStyle}>
              <iframe
                style={iframeStyle}
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCenter;