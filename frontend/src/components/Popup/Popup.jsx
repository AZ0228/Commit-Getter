import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './Popup.css'; // Assuming this contains your animation and styling
import useOutsideClick from '../../hooks/useClickOutside';
import Icon from '../Icon/Icon';

const Popup = ({ children, isOpen, onClose }) => {
    const [render, setRender] = useState(isOpen);
    const [show, setShow] = useState(false);

  const ref = useRef();

  useOutsideClick(ref, ()=>{
    handleClose();
  });

  useEffect(() => {
    if (isOpen) {
        setRender(true);
    }
  }, [isOpen]);

  useEffect(()=>{
    setTimeout(() => {
        setShow(true);
    }, 100);
  },[render]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
        onClose(); // Trigger the actual unmount after animation ends
        setRender(false);
    }, 300); // Match the exit animation duration
  };

  if (!isOpen && !render) {
    return null;
  }

  const renderChildrenWithClose = () => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { handleClose });
    }
    return children; // In case children are not valid React elements
  };    

  return ReactDOM.createPortal(
    <div className={`popup-overlay ${show ? 'fade-in' : 'fade-out'}`}>
      <div className={`popup-content ${show ? 'slide-in' : 'slide-out'}`} ref={ref}>
        <Icon dimension={16} type={"X"} onClick={handleClose} className="close-popup" />
        {renderChildrenWithClose()} {/* Render children with handleClose prop */}
      </div>
    </div>,
    document.body // Render the popup outside the root component for proper overlaying
  );
};

export default Popup;
