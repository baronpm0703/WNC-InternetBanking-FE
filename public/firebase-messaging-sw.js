importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const defaultConfig = {
  apiKey: true,
  projectId: true,
  messagingSenderId: true,
  appId: true,
};

firebase.initializeApp({
  apiKey: "AIzaSyC7wuJL5__xys5BxlBvBH1RBZKIRKZfsqM",
  authDomain: "wnc-ib.firebaseapp.com",
  projectId: "wnc-ib",
  storageBucket: "wnc-ib.firebasestorage.app",
  messagingSenderId: "37371725073",
  appId: "1:37371725073:web:0e9e82f3ce78e40291b8b0"
})

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});