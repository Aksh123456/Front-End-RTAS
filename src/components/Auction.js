// //-------------------------------- Working Code ------------------------------------//

// import React, { useEffect, useState, useRef } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:3000");

// const Auction = () => {
//   const [auctions, setAuctions] = useState([]);
//   const [timeLeft, setTimeLeft] = useState({});
//   const decodedRef = useRef(null);

//   useEffect(() => {
//     // Fetch auction data on component mount
//     const fetchAuctionData = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Get token from localStorage
//         if (!token) {
//           alert("You need to login to view the auction.");
//           return;
//         }

//         // Decode the token and store it in ref
//         const decoded = JSON.parse(atob(token.split(".")[1]));
//         decodedRef.current = decoded;
//         console.log(decoded, "decodedddddddd");

//         const response = await axios.get("http://localhost:3000/auction", {
//           headers: {
//             Authorization: `Bearer ${token}`, // Pass token in Authorization header
//           },
//         });

//         const auctionData = response.data.map((auction) => ({
//           id: auction._id, // Use `_id` as `id`
//           product: auction.product,
//           currentBid: auction.currentBid,
//           highestBidder: auction.highestBidder,
//           timer: auction.timer,
//           isActive: auction.isActive,
//           buyNowActive: auction.isBuyNowLive ? true : false,
//           isPlaceBidActive: auction.isActive === true ? true : false,
//           // buyNowTimer: auction.buyNowTimerLeft
//           //   ? new Date(new Date(auction.buyNowTimerLeft).getTime() + 5.5 * 60 * 60 * 1000)
//           //   : null,
//           buyNowTimer: auction.buyNowTimerLeft
//           ? new Date(new Date (auction.buyNowTimerLeft))
//           : null,
//         }));

//         console.log("Processed auction data:", auctionData);
//         setAuctions(auctionData); // Update state with mapped data
//       } catch (error) {
//         console.error("Error fetching auction data:", error);
//         alert("Failed to fetch auction data.");
//       }
//     };

//     fetchAuctionData(); // Fetch the auction data on component mount

//     // Socket event listeners to receive updates
//     socket.on("update", (data) => {
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) =>
//           auction.id === data.auctionId ? { ...auction, ...data } : auction
//         )
//       );
//     });

//     // Socket event for auction ending
//     socket.on("auctionEnd", (data) => {
//       const { auctionId, winner: auctionWinner } = data;
//       console.log("Socket Data Received:", data);

//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (auction.id === auctionId) {
//             return {
//               ...auction,
//               isPlaceBidActive: false, // Disable Place Bid for everyone
//               buyNowActive: decodedRef.current?.email === auctionWinner, // Enable Buy Now for the winner
//               isWinner:
//                 decodedRef.current?.email === auctionWinner
//                   ? auctionWinner
//                   : false,
//               winner: auctionWinner, // Store winner
//             };
//           }
//           return auction;
//         })
//       );
//     });

//     return () => {
//       socket.off("update");
//       socket.off("auctionEnd");
//     };
//   }, []);

//   // Place bid function
//   const placeBid = (auctionId) => {
//     console.log(auctionId, "auctions,,,");

//     const auction = auctions.find((a) => a.id === auctionId);
//     if (!auction || !auction.isPlaceBidActive) {
//       alert("Bidding is currently disabled.");
//       return;
//     }

//     const bidAmount = auction.currentBid + 5;
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("You need to login to place a bid.");
//       return;
//     }

//     const auctionId2 = auction.id;
//     socket.emit("bid", { bidAmount, auctionId2, token });
//   };

//   const buyNow = (auctionId) => {
//     const auction = auctions.find((a) => a.id === auctionId);
//     if (auction) {
//       alert("Congratulations! You are the winner. Proceeding to purchase.");
//       const auctionId2 = auction.id;
//       socket.emit("updateAuction", auctionId2);
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((a) =>
//           a.id === auctionId ? { ...a, isPlaceBidActive: true } : a
//         )
//       );
//     }
//   };

//   useEffect(() => {
//     const updateTimers = () => {
//       const currentTime = new Date().getTime(); // Current time in ms

//       setTimeLeft((prevTimeLeft) => {
//         const newTimeLeft = {};
//         auctions.forEach((auction) => {
//           if (auction.buyNowTimer) {
//             const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//             newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
//           }
//         });
//         return newTimeLeft;
//       });
//     };

//     const interval = setInterval(updateTimers, 1000); // Update every second

//     return () => clearInterval(interval);
//   }, [auctions]);

// // Timer expiration logic
// useEffect(() => {
//   const expiredAuctions = auctions.filter(
//     (auction) => timeLeft[auction.id] <= 0 && auction.buyNowActive
//   );

//   if (expiredAuctions.length > 0) {
//     setAuctions((prevAuctions) =>
//       prevAuctions.map((auction) => {
//         if (expiredAuctions.some((exp) => exp.id === auction.id)) {
//           return {
//             ...auction,
//             buyNowActive: false, // Disable Buy Now
//             isPlaceBidActive: true, // Enable Place Bid
//           };
//         }
//         return auction;
//       })
//     );
//   }
// }, [timeLeft, auctions]);

// return (
//   <div>
//     <h1>Auctions</h1>
//     {auctions.map((auction) => {
//       const remainingTime = timeLeft[auction.id] || 0;
//       const minutes = Math.floor(remainingTime / 60000);
//       const seconds = Math.floor((remainingTime % 60000) / 1000);

//       return (
//         <div key={auction.id}>
//           <p>Product: {auction.product}</p>
//           <p>Current Bid: ${auction.currentBid}</p>
//           <p>Highest Bidder: {auction.highestBidder}</p>
//           <p>Time Remaining: {auction.timer} seconds</p>

//           {/* Place Bid Button */}
//           <button
//             onClick={() => placeBid(auction.id)}
//             disabled={auction.isPlaceBidActive === false}
//           >
//             Place Bid
//           </button>

//           {/* Buy Now Logic */}
//           {auction.buyNowActive &&
//             decodedRef.current?.email === auction.highestBidder && (
//               <div>
//                 <button
//                   onClick={() => {
//                     buyNow(auction.id); // Handle Buy Now logic

//                     // Remove the item from the list
//                     setAuctions((prevAuctions) =>
//                       prevAuctions.filter((a) => a.id !== auction.id)
//                     );

//                     setTimeLeft((prevTimeLeft) => ({
//                       ...prevTimeLeft,
//                       [auction.id]: 0, // Stop the timer
//                     }));
//                   }}
//                   disabled={remainingTime <= 0} // Disable if timer has expired
//                 >
//                   Buy Now
//                 </button>
//                 {remainingTime > 0 ? (
//                   <p>
//                     Buy Now expires in: {minutes} minutes {seconds} seconds
//                   </p>
//                 ) : (
//                   <p>Buy Now offer expired</p>
//                 )}
//               </div>
//             )}
//         </div>
//       );
//     })}
//   </div>
// );

// };

// export default Auction;

// -------------------------working code -------------------------//

// src/components/Auction.js

import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { fetchAuctions } from "../api/auction";
import { getToken } from "../api/token";
import "../css/Auction.css";
const socket = io("http://localhost:3000");

// const Auction = () => {
//   const [auctions, setAuctions] = useState([]);
//   const [timeLeft, setTimeLeft] = useState({});
//   const decodedRef = useRef(null);

//   useEffect(() => {
//     // Fetch auction data on component mount
//     const fetchAuctionData = async () => {
//       try {
//         const token = getToken(); // Get token from localStorage
//         if (!token) {
//           alert("You need to login to view the auction.");
//           return;
//         }

//         // Decode the token and store it in ref
//         const decoded = JSON.parse(atob(token.split(".")[1]));
//         decodedRef.current = decoded;

//         const auctionData = await fetchAuctions(); // Fetch auctions using the API
//         const processedAuctionData = auctionData.map((auction) => ({
//           // id: auction._id,
//           // product: auction.product,
//           // currentBid: auction.currentBid,
//           // highestBidder: auction.highestBidder,
//           // timer: auction.timer,
//           // isActive: auction.isActive,
//           // buyNowActive: auction.isBuyNowLive ? true : false,
//           // buyNowTimer: auction.buyNowTimerLeft ? new Date(new Date(auction.buyNowTimerLeft)) : null,

//           id: auction._id, // Use `_id` as `id`
//           product: auction.product,
//           currentBid: auction.currentBid,
//           highestBidder: auction.highestBidder,
//           timer: auction.timer,
//           isActive: auction.isActive,
//           buyNowActive: auction.isBuyNowLive ? true : false,
//           isPlaceBidActive: auction.isActive === true ? true : false,
//           // buyNowTimer: auction.buyNowTimerLeft
//           //   ? new Date(new Date(auction.buyNowTimerLeft).getTime() + 5.5 * 60 * 60 * 1000)
//           //   : null,
//           buyNowTimer: auction.buyNowTimerLeft
//             ? new Date(new Date(auction.buyNowTimerLeft))
//             : null,
//         }));

//         setAuctions(processedAuctionData);
//       } catch (error) {
//         console.error("Error fetching auction data:", error);
//         alert("Failed to fetch auction data.");
//       }
//     };

//     fetchAuctionData(); // Fetch the auction data on component mount

//     socket.on("update", (data) => {
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) =>
//           auction.id === data.auctionId ? { ...auction, ...data } : auction
//         )
//       );
//     });

//     socket.on("auctionEnd", (data) => {
//       const { auctionId, winner: auctionWinner } = data;
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (auction.id === auctionId) {
//             return {
//               ...auction,
//               isPlaceBidActive: false, // Disable Place Bid for everyone
//               buyNowActive: decodedRef.current?.email === auctionWinner, // Enable Buy Now for the winner
//               isWinner:
//                 decodedRef.current?.email === auctionWinner
//                   ? auctionWinner
//                   : false,
//               winner: auctionWinner, // Store winner
//             };
//           }
//           return auction;
//         })
//       );
//     });

//     return () => {
//       socket.off("update");
//       socket.off("auctionEnd");
//     };
//   }, []);

//   // Place bid function
//   const placeBid = (auctionId) => {
//     console.log(auctionId, "id");
//     const auction = auctions.find((a) => a.id === auctionId);
//     console.log(auction, "auction____________________");
//     if (!auction || !auction.isPlaceBidActive) {
//       alert("Bidding is currently disabled.");
//       return;
//     }

//     const bidAmount = auction.currentBid + 5;
//     const token = getToken();

//     if (!token) {
//       alert("You need to login to place a bid.");
//       return;
//     }
//     const auctionId2 = auction.id;
//     socket.emit("bid", { bidAmount, auctionId2, token });
//   };

//   const buyNow = (auctionId) => {
//     const auction = auctions.find((a) => a.id === auctionId);
//     if (auction) {
//       alert("Congratulations! You are the winner. Proceeding to purchase.");
//       const auctionId2 = auction.id;
//       socket.emit("updateAuction", auctionId2);
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((a) =>
//           a.id === auctionId ? { ...a, isPlaceBidActive: true } : a
//         )
//       );
//     }
//   };



//   // Timer Expires functionality 

//   // useEffect(() => {
//   //   const updateTimers = () => {
//   //     const currentTime = new Date().getTime();
//   //     setTimeLeft((prevTimeLeft) => {
//   //       const newTimeLeft = {};
//   //       auctions.forEach((auction) => {
//   //         if (auction.buyNowTimer) {
//   //           const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//   //           newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
//   //         }
//   //       });
//   //       return newTimeLeft;
//   //     });
//   //   };

//   //   const interval = setInterval(updateTimers, 1000);

//   //   return () => clearInterval(interval);
//   // }, [auctions]);



//   // -------------------- working raat ke 8 baje ---------------------------//
//   // useEffect(() => {
//   //   const updateTimers = () => {
//   //     const currentTime = new Date().getTime(); // Current time in ms
  
//   //     setTimeLeft((prevTimeLeft) => {
//   //       const newTimeLeft = {};
//   //       auctions.forEach((auction) => {
//   //         if (auction.buyNowTimer) {
//   //           const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//   //           newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
  
//   //           // Emit `buyNowExpired` event if Buy Now timer has expired
//   //           if (remainingTime <= 0 && auction.buyNowActive) {
//   //             // Emit event to the server when Buy Now timer expires
//   //             socket.emit("buyNowExpired", { auctionId: auction.id });
//   //             console.log(`Buy Now timer expired for auction ${auction.id}`);
//   //           }
//   //         }
//   //       });
//   //       return newTimeLeft;
//   //     });
//   //   };
  
//   //   const interval = setInterval(updateTimers, 1000); // Update every second
  
//   //   return () => clearInterval(interval); // Clear interval on cleanup
//   // }, [auctions]);

//   // -------------------- working raat ke 8 baje ---------------------------//

//   // useEffect(() => {
//   //   const updateTimers = () => {
//   //     const currentTime = new Date().getTime(); // Current time in ms
  
//   //     setTimeLeft((prevTimeLeft) => {
//   //       const newTimeLeft = {};
//   //       const expiredAuctions = []; // Track expired auctions
  
//   //       setAuctions((prevAuctions) =>
//   //         prevAuctions.map((auction) => {
//   //           if (auction.buyNowTimer) {
//   //             const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//   //             newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
  
//   //             if (remainingTime <= 0 && auction.buyNowActive) {
//   //               // Timer expired, mark as inactive and emit event
//   //               expiredAuctions.push(auction.id);
  
//   //               return {
//   //                 ...auction,
//   //                 buyNowActive: false, // Disable Buy Now
//   //                 isPlaceBidActive: true, // Re-enable bidding
//   //               };
//   //             }
//   //           }
//   //           return auction;
//   //         })
//   //       );
  
//   //       // Emit events for expired auctions
//   //       expiredAuctions.forEach((auctionId) => {
//   //         socket.emit("buyNowExpired", { auctionId });
//   //         console.log(`Buy Now timer expired for auction ${auctionId}`);
//   //       });
  
//   //       return newTimeLeft;
//   //     });
//   //   };
  
//   //   const interval = setInterval(updateTimers, 1000); // Update every second
  
//   //   return () => clearInterval(interval); // Clear interval on cleanup
//   // }, [auctions]);
  

//   useEffect(() => {
//   const updateTimers = () => {
//     const currentTime = new Date().getTime(); // Current time in ms

//     setTimeLeft((prevTimeLeft) => {
//       const newTimeLeft = {};
//       const expiredAuctions = []; // Track expired auctions

//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (auction.buyNowTimer) {
//             const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//             newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;

//             // If Buy Now timer expires
//             if (remainingTime <= 0 && auction.buyNowActive) {
//               expiredAuctions.push(auction.id);

//               return {
//                 ...auction,
//                 buyNowActive: false, // Disable Buy Now
//                 isPlaceBidActive: true, // Enable Place Bid for others
//               };
//             }
//           }
//           return auction;
//         })
//       );

//       // Emit `buyNowExpired` events for expired auctions
//       expiredAuctions.forEach((auctionId) => {
//         socket.emit("buyNowExpired", { auctionId });
//         console.log(`Buy Now timer expired for auction ${auctionId}`);
//       });

//       return newTimeLeft;
//     });
//   };

//   const interval = setInterval(updateTimers, 1000); // Update timers every second

//   return () => clearInterval(interval); // Cleanup interval on unmount
// }, [auctions]);



// // Handle socket events
// useEffect(() => {
//   socket.on("auctionEnd", (data) => {
//     const { auctionId, winner: auctionWinner } = data;

//     setAuctions((prevAuctions) =>
//       prevAuctions.map((auction) => {
//         if (auction.id === auctionId) {
//           return {
//             ...auction,
//             isPlaceBidActive: false, // Disable Place Bid for everyone
//             buyNowActive: decodedRef.current?.email === auctionWinner, // Enable Buy Now only for the winner
//             isWinner: decodedRef.current?.email === auctionWinner,
//             winner: auctionWinner, // Store the winner
//           };
//         }
//         return auction;
//       })
//     );

//     setTimeLeft((prevTimeLeft) => ({
//       ...prevTimeLeft,
//       [auctionId]: 0, // Set timer to 0 for the ended auction
//     }));
//   });

//   return () => {
//     socket.off("auctionEnd");
//   };
// }, []);


  

//   useEffect(() => {
//     const expiredAuctions = auctions.filter(
//       (auction) => timeLeft[auction.id] <= 0 && auction.buyNowActive
//     );

//     if (expiredAuctions.length > 0) {
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (expiredAuctions.some((exp) => exp.id === auction.id)) {
//             return {
//               ...auction,
//               buyNowActive: false,
//               isPlaceBidActive: true,
//             };
//           }
//           return auction;
//         })
//       );
//     }
//   }, [timeLeft, auctions]);

//   return (
//     <div className="auction-container">
//       <h1>Auctions</h1>
//       {auctions.map((auction) => {
//         const remainingTime = timeLeft[auction.id] || 0;
//         const minutes = Math.floor(remainingTime / 60000);
//         const seconds = Math.floor((remainingTime % 60000) / 1000);

//         return (
//           <div className="auction-item" key={auction.id}>
//             <p>Product: {auction.product}</p>
//             <p>Current Bid: ${auction.currentBid}</p>
//             <p>Highest Bidder: {auction.highestBidder}</p>
//             <p>Time Remaining: {auction.timer} seconds</p>

//             <button
//               onClick={() => placeBid(auction.id)}
//               disabled={auction.isPlaceBidActive === false ||  auction.isWinner}
//             >
//               Place Bid
//             </button>

//             {/* {auction.buyNowActive &&
//               decodedRef.current?.email === auction.highestBidder && (
//                 <div>
//                   <button
//                     onClick={() => buyNow(auction.id)}
//                     disabled={remainingTime <= 0}
//                   >
//                     Buy Now
//                   </button>
//                   {remainingTime > 0 ? (
//                     <p>
//                       Buy Now expires in: {minutes} minutes {seconds} seconds
//                     </p>
//                   ) : (
//                     <p>Buy Now offer expired</p>
//                   )}
//                 </div>
//               )} */}

//             {/* Buy Now Logic */}


//             {/* {auction.buyNowActive &&
//               decodedRef.current?.email === auction.highestBidder && (
//                 <div>
//                   <button
//                     onClick={() => {
//                       buyNow(auction.id); // Handle Buy Now logic

//                       // Remove the item from the list
//                       setAuctions((prevAuctions) =>
//                         prevAuctions.filter((a) => a.id !== auction.id)
//                       );

//                       setTimeLeft((prevTimeLeft) => ({
//                         ...prevTimeLeft,
//                         [auction.id]: 0, // Stop the timer
//                       }));
//                     }}
//                     disabled={remainingTime <= 0} // Disable if timer has expired
//                   >
//                     Buy Now
//                   </button>
//                   {remainingTime > 0 ? (
//                     <p>
//                       Buy Now expires in: {minutes} minutes {seconds} seconds
//                     </p>
//                   ) : (
//                     <p>Buy Now offer expired</p>
//                   )}
//                 </div>
//               )} */}

// {auction.buyNowActive &&
//   decodedRef.current?.email === auction.highestBidder && (
//     <div>
//       <button
//         onClick={() => {
//           buyNow(auction.id);
//           setAuctions((prevAuctions) =>
//             prevAuctions.filter((a) => a.id !== auction.id)
//           );
//         }}
//         disabled={remainingTime <= 0} // Disable if timer has expired
//       >
//         Buy Now
//       </button>
//       {remainingTime > 0 ? (
//         <p>
//           Buy Now expires in: {minutes} minutes {seconds} seconds
//         </p>
//       ) : (
//         <p>Buy Now offer expired</p>
//       )}
//     </div>
//   )}

//           </div>
//         );
//       })}
//     </div>
//   );
// };



// this code is working recently



const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const decodedRef = useRef(null);

  useEffect(() => {
    // Fetch auction data on component mount
    const fetchAuctionData = async () => {
      try {
        const token = getToken(); // Get token from localStorage
        if (!token) {
          alert("You need to login to view the auction.");
          return;
        }

        // Decode the token and store it in ref
        const decoded = JSON.parse(atob(token.split(".")[1]));
        decodedRef.current = decoded;

        const auctionData = await fetchAuctions(); // Fetch auctions using the API
        const processedAuctionData = auctionData.map((auction) => ({
          // id: auction._id,
          // product: auction.product,
          // currentBid: auction.currentBid,
          // highestBidder: auction.highestBidder,
          // timer: auction.timer,
          // isActive: auction.isActive,
          // buyNowActive: auction.isBuyNowLive ? true : false,
          // buyNowTimer: auction.buyNowTimerLeft ? new Date(new Date(auction.buyNowTimerLeft)) : null,

          id: auction._id, // Use _id as id
          product: auction.product,
          currentBid: auction.currentBid,
          highestBidder: auction.highestBidder,
          timer: auction.timer,
          isActive: auction.isActive,
          buyNowActive: auction.isBuyNowLive ? true : false,
          isPlaceBidActive: auction.isActive === true ? true : false,
          // buyNowTimer: auction.buyNowTimerLeft
          //   ? new Date(new Date(auction.buyNowTimerLeft).getTime() + 5.5 * 60 * 60 * 1000)
          //   : null,
          buyNowTimer: auction.buyNowTimerLeft
            ? new Date(new Date(auction.buyNowTimerLeft))
            : null,
        }));

        setAuctions(processedAuctionData);
      } catch (error) {
        console.error("Error fetching auction data:", error);
        alert("Failed to fetch auction data.");
      }
    };

    fetchAuctionData(); // Fetch the auction data on component mount

    socket.on("update", (data) => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === data.auctionId ? { ...auction, ...data } : auction
        )
      );
    });

    socket.on("auctionEnd", (data) => {
      const { auctionId, winner: auctionWinner } = data;
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => {
          if (auction.id === auctionId) {
            return {
              ...auction,
              isPlaceBidActive: false, // Disable Place Bid for everyone
              buyNowActive: decodedRef.current?.email === auctionWinner, // Enable Buy Now for the winner
              isWinner:
                decodedRef.current?.email === auctionWinner
                  ? auctionWinner
                  : false,
              winner: auctionWinner, // Store winner
            };
          }
          return auction;
        })
      );
    });

    return () => {
      socket.off("update");
      socket.off("auctionEnd");
    };
  }, []);

  // Place bid function
  const placeBid = (auctionId) => {
    console.log(auctionId, "id");
    const auction = auctions.find((a) => a.id === auctionId);
    console.log(auction, "auction____________________");
    if (!auction || !auction.isPlaceBidActive) {
      alert("Bidding is currently disabled.");
      return;
    }

    const bidAmount = auction.currentBid + 5;
    const token = getToken();

    if (!token) {
      alert("You need to login to place a bid.");
      return;
    }
    const auctionId2 = auction.id;
    socket.emit("bid", { bidAmount, auctionId2, token });
  };

  const buyNow = (auctionId) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (auction) {
      alert("Congratulations! You are the winner. Proceeding to purchase.");
      const auctionId2 = auction.id;
      socket.emit("updateAuction", auctionId2);
      setAuctions((prevAuctions) =>
        prevAuctions.map((a) =>
          a.id === auctionId ? { ...a, isPlaceBidActive: true } : a
        )
      );
    }
  };



  // Timer Expires functionality 

  // useEffect(() => {
  //   const updateTimers = () => {
  //     const currentTime = new Date().getTime();
  //     setTimeLeft((prevTimeLeft) => {
  //       const newTimeLeft = {};
  //       auctions.forEach((auction) => {
  //         if (auction.buyNowTimer) {
  //           const remainingTime = auction.buyNowTimer.getTime() - currentTime;
  //           newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
  //         }
  //       });
  //       return newTimeLeft;
  //     });
  //   };

  //   const interval = setInterval(updateTimers, 1000);

  //   return () => clearInterval(interval);
  // }, [auctions]);


  useEffect(() => {
    const updateTimers = () => {
      const currentTime = new Date().getTime(); // Current time in ms
  
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = {};
        auctions.forEach((auction) => {
          if (auction.buyNowTimer) {
            const remainingTime = auction.buyNowTimer.getTime() - currentTime;
            newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
  
            // Emit buyNowExpired event if Buy Now timer has expired
            if (remainingTime <= 0 && auction.buyNowActive) {
              // Emit event to the server when Buy Now timer expires
              socket.emit("buyNowExpired", { auctionId: auction.id });
              console.log(`Buy Now timer expired for auction ${auction.id}`);
            }
          }
        });
        return newTimeLeft;
      });
    };
  
    const interval = setInterval(updateTimers, 1000); // Update every second
  
    return () => clearInterval(interval); // Clear interval on cleanup
  }, [auctions]);

  

  useEffect(() => {
    const expiredAuctions = auctions.filter(
      (auction) => timeLeft[auction.id] <= 0 && auction.buyNowActive
    );

    if (expiredAuctions.length > 0) {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => {
          if (expiredAuctions.some((exp) => exp.id === auction.id)) {
            return {
              ...auction,
              buyNowActive: false,
              isPlaceBidActive: true,
            };
          }
          return auction;
        })
      );
    }
  }, [timeLeft, auctions]);

  return (
    <div className="auction-container">
      <h1>Auctions</h1>
      {auctions.map((auction) => {
        const remainingTime = timeLeft[auction.id] || 0;
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        return (
          <div className="auction-item" key={auction.id}>
            <p>Product: {auction.product}</p>
            <p>Current Bid: ${auction.currentBid}</p>
            <p>Highest Bidder: {auction.highestBidder}</p>
            <p>Time Remaining: {auction.timer} seconds</p>

            <button
              onClick={() => placeBid(auction.id)}
              disabled={auction.isPlaceBidActive === false}
            >
              Place Bid
            </button>

            {/* {auction.buyNowActive &&
              decodedRef.current?.email === auction.highestBidder && (
                <div>
                  <button
                    onClick={() => buyNow(auction.id)}
                    disabled={remainingTime <= 0}
                  >
                    Buy Now
                  </button>
                  {remainingTime > 0 ? (
                    <p>
                      Buy Now expires in: {minutes} minutes {seconds} seconds
                    </p>
                  ) : (
                    <p>Buy Now offer expired</p>
                  )}
                </div>
              )} */}

            {/* Buy Now Logic */}
            {auction.buyNowActive &&
              decodedRef.current?.email === auction.highestBidder && (
                <div>
                  <button
                    onClick={() => {
                      buyNow(auction.id); // Handle Buy Now logic

                      // Remove the item from the list
                      setAuctions((prevAuctions) =>
                        prevAuctions.filter((a) => a.id !== auction.id)
                      );

                      setTimeLeft((prevTimeLeft) => ({
                        ...prevTimeLeft,
                        [auction.id]: 0, // Stop the timer
                      }));
                    }}
                    disabled={remainingTime <= 0} // Disable if timer has expired
                  >
                    Buy Now
                  </button>
                  {remainingTime > 0 ? (
                    <p>
                      Buy Now expires in: {minutes} minutes {seconds} seconds
                    </p>
                  ) : (
                    <p>Buy Now offer expired</p>
                  )}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};



// this code is working 





export default Auction;
