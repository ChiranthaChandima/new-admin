import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesource";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const Datatable = ({route, title, columns}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, route),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
        sessionStorage.setItem(route, JSON.stringify(list));

        console.log(route, list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, [route]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, route, id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };


  const handleStatus = async (id, action) => {
    try {
      await updateDoc(doc(db, route, id), {
        adminApproval: action,
      });
    } catch (err) {
      console.log(err);
    }
  };

  // const actionColumn = [
  //   {
  //     field: "action",
  //     headerName: "Action",
  //     width: 200,
  //     renderCell: (params) => {
  //       return (
  //         <div className="cellAction">
  //           <Link to={`/${route}/${params.row.id}`} style={{ textDecoration: "none" }}>
  //             <div className="viewButton">Edit</div>
  //           </Link>
  //           <div
  //             className="deleteButton"
  //             onClick={() => handleDelete(params.row.id)}
  //           >
  //             Delete
  //           </div>
  //         </div>
  //       );
  //     },
  //   },
  // ];
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        const { row } = params;
        const { id } = row;
        const currentRoute = window.location.pathname.split("/")[1]; // Extracting current route from URL
  
        // Check if current route is one of the restricted routes
        const isRestrictedRoute = ["users", "record", "review", "instructor"].includes(currentRoute);
  
        // Conditionally render Link based on route
        const editLink = isRestrictedRoute ? null : (
          <Link to={`/${route}/${id}`} style={{ textDecoration: "none" }}>
            <div className="viewButton">Edit</div>
          </Link>
        );
  
        // Conditionally render "Approve" and "Reject" buttons for instructor route
        const instructorButtons = window.location.pathname.includes("/instructor") && (
          <div className="cellAction">
            <div
              className="viewButton"
              onClick={() => handleStatus(id, true)}
            >
              Approve
            </div>
            <div
              className="deleteButton"
              onClick={() => handleStatus(id, false)}
            >
              Reject
            </div>
          </div>
        );
  
        return (
          <div className="cellAction">
            {editLink}
            {instructorButtons}
            <div
              className="deleteButton"
              onClick={() => handleDelete(id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  
  
  return (
    // <div className="datatable">
    //   <div className="datatableTitle">
    //     {title}
    //     <Link to={`/${route}/create`} className="link">
    //       Add New
    //     </Link>
    //   </div>
    //   <DataGrid
    //     className="datagrid"
    //     rows={data}
    //     columns={columns.concat(actionColumn)}
    //     pageSize={9}
    //     rowsPerPageOptions={[9]}
    //     checkboxSelection
    //   />
    // </div>
    <div className="datatable">
    <div className="datatableTitle">
      {title}
      {/* Conditionally render Add New link based on route */}
      {["user", "record", "review", "instructor"].includes(route) ? null : (
        <Link to={`/${route}/create`} className="link">
          Add New
        </Link>
      )}
    </div>
    <DataGrid
      className="datagrid"
      rows={data}
      columns={columns.concat(actionColumn)}
      pageSize={9}
      rowsPerPageOptions={[9]}
      checkboxSelection
    />
  </div>
  );
};

export default Datatable;
