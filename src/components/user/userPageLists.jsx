import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { USERLIST_URL } from "../../utils/constants";

const UserPageLists = () => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const accessToken = useSelector((state) => state.auth.accessToken);
    const userType = useSelector((state) => state.auth.userType);
    const parentType = useSelector((state) => state.auth.parentType);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    login_user_type: userType ?? "",
                    login_parent_type: parentType ?? "",
                    bkms_id: "",
                    name: "",
                    gender: "",
                    wing: "",
                    school_year: "",
                    center: "",
                    bst_kst_number: 0, // treat as false
                    gujarati_student: 0, // treat as false
                    networking_individual: 0, // treat as false
                    status: "",
                    satsung_status: "",
                    region: "",
                    user_group: "",
                    fname: "",
                    mname: "",
                    lname: "",
                    user_id: "",
                    baps_id: "",
                    email: "",
                    sabha_attendence: "",
                    page: 1,
                    limit: 50,
                });

                const response = await fetch(`${USERLIST_URL}?${params.toString()}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const data = await response.json().catch(() => ({}));
                setUserList(data?.data?.records || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [accessToken, userType, parentType]);

    if (loading) return <p style={{ padding: "16px" }}>Loading...</p>;
    if (error) return <p style={{ padding: "16px", color: "red" }}>Error: {error}</p>;

    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={th}>User ID</th>
                        <th style={th}>MIS ID</th>
                        <th style={th}>BAPS ID</th>
                        <th style={th}>First Name</th>
                        <th style={th}>Middle Name</th>
                        <th style={th}>Last Name</th>
                        <th style={th}>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {userList.map((user) => (
                        <tr key={user.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                            <td style={td}>{user.id}</td>
                            <td style={td}>{user.mis_id}</td>
                            <td style={td}>{user.baps_id}</td>
                            <td style={td}>{user.FirstName}</td>
                            <td style={td}>{user.MiddleName}</td>
                            <td style={td}>{user.LastName}</td>
                            <td style={td}>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const th = {
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #ccc",
    whiteSpace: "nowrap",
};

const td = {
    padding: "10px 14px",
    fontSize: "14px",
};

export default UserPageLists;
