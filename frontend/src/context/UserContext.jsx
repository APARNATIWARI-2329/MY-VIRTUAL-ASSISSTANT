import { useState, useEffect, useCallback } from "react";
import { userDataContext } from './userDataContext'
import axios from 'axios'

function UserContext({ children }) {

const serverUrl = import.meta.env.VITE_SERVER_URL
console.log("SERVER URL =", serverUrl);
  const [userData, setUserData] = useState(null)

  const [frontendImage, setFrontendImage] = useState(null);

  const [backendImage, setBackendImage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);

  const [assistantName, setAssistantName] = useState("");

  const handleCurrentUser = useCallback(async () => {
  try {
    const result = await axios.get(
      `${serverUrl}/api/user/current`,
      {
        withCredentials: true
      }
    );

    setUserData(result.data);
    console.log(result.data);

  } catch (error) {
    console.error(error);
  }
}, [serverUrl]);

const getGeminiResponse = useCallback(async (command) => {
  try {
    const result = await axios.post(
      `${serverUrl}/api/user/askToAssistant`,
      { command },
      { withCredentials: true }
    );

    return result.data;
  } catch (error) {
    console.error(
      "Gemini Request Failed:",
      error?.response?.data || error.message
    );

    return {
      type: "general",
      userInput: command,
      response: "Sorry, AI service is currently unavailable."
    };
  }
}, [serverUrl]);


useEffect(() => {
  const fetchUser = async () => {
    await handleCurrentUser();
  };

  fetchUser();
}, [handleCurrentUser]);

  const value = {
  serverUrl,
  userData,
  setUserData,
  frontendImage,
  setFrontendImage,
  backendImage,
  setBackendImage,
  selectedImage,
  setSelectedImage,
  assistantName,
  setAssistantName,
  getGeminiResponse,
  handleCurrentUser
}

  return (

    <userDataContext.Provider value={value}>

      {children}

    </userDataContext.Provider>

  )
}

export default UserContext