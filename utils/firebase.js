// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjA873Pb_r_9O2bnkJ8ni2v51zyrDoGaA",
  authDomain: "wfw-system.firebaseapp.com",
  projectId: "wfw-system",
  storageBucket: "wfw-system.appspot.com",
  messagingSenderId: "448478680138",
  appId: "1:448478680138:web:3ad628fc23a39a7c1a42b3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a root reference
const storage = getStorage();

// Create a reference to 'mountains.jpg'
// While the file names are the same, the references point to different files

const uploadFile = async (fileName, file) => {
  const pdfReportRef = ref(storage, `/reports/${fileName}.pdf`);
  try {
    // await uploadBytes(pdfReportRef, file);
    const url = await firestoreUploadFile(pdfReportRef, file);
    return url;
  } catch (error) {
    console.log(error);
    return error;
  }
  // return uploadBytes(pdfReportRef, file).then( async (snapshot) => {
  //     const url = await getDownloadURL(pdfReportRef)
  //     return url;
  //   }).catch(error => {
  //     console.log(error)
  //     return error
  // });
};

const uploadOrderAttachment = async (companyId, fileName, file, mimetype) => {
  if (!file) throw new Error("file is undefined!");
  const orderAttachments = ref(
    storage,
    `/orderAttachments/${companyId}/${fileName}.${mimetype}`
  );
  try {
    // await uploadBytes(pdfReportRef, file);
    const url = await firestoreUploadFile(orderAttachments, file);
    console.log("attachemnt URL : ", url);
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const firestoreUploadFile = async (storageRef, file) => {
  await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(storageRef);
  return fileUrl;
};

const uploadCompanyFile = async (fileName, file) => {
  const companyRef = ref(storage, `/company/${fileName}.${file.mimetype}`);
  try {
    const url = await firestoreUploadFile(companyRef, file);
    return url;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const uploadUserFile = async (fileName, file) => {
  const userRef = ref(storage, `/user/${fileName}.${file.mimetype}`);
  try {
    const url = await firestoreUploadFile(userRef, file);
    return url;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = {
  uploadFile,
  uploadCompanyFile,
  uploadUserFile,
  uploadOrderAttachment,
};
