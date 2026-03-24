import { Outlet, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { hideNotification } from "../store/notificationStore";
import Message from "./Message";
import apple from "../assets/images/apple.svg";
import wifi from "../assets/images/wifi.svg";
import switc from "../assets/images/switch.svg";
import battery from "../assets/images/battery.100.svg";
import face from "../assets/images/face.png";
import safari from "../assets/images/safari.png";
import book from "../assets/images/book.png";
import calendar from "../assets/images/calendar.png";
import cart from "../assets/images/cart.svg";
import ellips from "../assets/images/Ellipse 1.svg";
import divider from "../assets/images/Divider.svg";
import avito from "../assets/images/avito.png";
import dots from "../assets/images/Traffic Lights.svg";

function Layout() {
  const dispatch = useDispatch();
  const { show, type } = useSelector((state: RootState) => state.notification);
  const location = useLocation();
  const path = location.pathname;
  const isAdDetail = /^\/ads\/\d+$/.test(path);
  const isAdEdit = /^\/ads\/\d+\/edit$/.test(path);
  const hasWhiteBg = isAdDetail || isAdEdit;

  return (
    <div className="app-layout">
      <header className="app-header align-items-center">
        <div className="d-flex container-fluid justify-content-between px-0">
          <div className="d-flex container-fluid justify-content-start px-0">
            <div className="d-flex align-items-center apple-wrapper">
              <img src={apple} className="apple_image" alt="Apple"></img>
            </div>
            <div className="d-flex align-items-center text-wrapper fw-bold">
              Safari
            </div>
            <div className="d-flex align-items-center text-wrapper">File</div>
            <div className="d-flex align-items-center text-wrapper">Edit</div>
            <div className="d-flex align-items-center text-wrapper">View</div>
            <div className="d-flex align-items-center text-wrapper">
              History
            </div>
            <div className="d-flex align-items-center text-wrapper">Window</div>
            <div className="d-flex align-items-center text-wrapper">Help</div>
          </div>
          <div className="d-flex container-fluid justify-content-end px-0">
            <div
              className="d-flex align-items-center header-image-wrapper"
              style={{ marginRight: "-6px" }}
            >
              <img src={wifi} className="apple_image" alt="Wifi"></img>
            </div>
            <div className="d-flex align-items-center header-image-wrapper">
              <img src={battery} className="apple_image" alt="Battery"></img>
            </div>
            <div className="d-flex align-items-center header-image-wrapper">
              <img src={switc} className="apple_image" alt="Swicth"></img>
            </div>
            <div className="d-flex align-items-center gap-0 ms-1-2">
              <div className="text-wrapper px-4px me-0">Mon Jun 22</div>
              <div className="text-wrapper px-4px">9:41 AM</div>
            </div>
          </div>
        </div>
      </header>

      {show && (
        <Message type={type} onClose={() => dispatch(hideNotification())} />
      )}

      <main className="app-main d-flex flex-column justify-content-center">
        <div className={`browser-window ${hasWhiteBg ? "white-bg" : ""}`}>
          <div className="browser-header">
            <div className="dots">
              <img src={dots}></img>
            </div>
            <div className="browser-title-wrapper">
              <Link to="/ads" className="text-decoration-none">
                <div className="d-flex browser-title align-items-center justify-content-center">
                  <div className="d-flex logo-wrapper justify-content-center align-items-center">
                    <img src={avito} className="logo" alt="Avito"></img>
                  </div>
                  avito.ru
                </div>
              </Link>
            </div>
          </div>
          {isAdDetail || isAdEdit ? (
            <div className="ad-detail-content">
              <Outlet />
            </div>
          ) : (
            <div className="content-card">
              <Outlet />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="d-flex justify-content-center container-fluid text-center">
          <div className="footer">
            <div className="d-flex align-items-center footer-wrapper">
              <img src={face} className="footer_image" alt="Finder"></img>
            </div>
            <div className="d-flex align-items-center footer-wrapper position-relative">
              <img src={safari} className="footer_image" alt="Safari"></img>
              <img src={ellips} className="dot-icon" alt="Indicator"></img>
            </div>
            <div className="d-flex align-items-center footer-wrapper">
              <img src={book} className="footer_image" alt="Book"></img>
            </div>
            <div className="d-flex align-items-center footer-wrapper">
              <img src={calendar} className="footer_image" alt="Calendar"></img>
            </div>
            <div className="d-flex align-items-center footer-wrapper">
              <img
                src={divider}
                className="footer_image divider"
                alt="Divider"
              ></img>
            </div>
            <div className="d-flex align-items-center footer-wrapper ms-auto">
              <img
                src={cart}
                className="footer_image cart-image"
                alt="Trash"
              ></img>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
