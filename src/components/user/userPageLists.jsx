import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Alert,
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from "@mui/material";
import { USERLIST_URL } from "../../utils/constants";
import { authFetch } from "../../utils/apiClient";

const UserPageLists = () => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);

    const accessToken = useSelector((state) => state.auth.accessToken);
    const userType = useSelector((state) => state.auth.userType);
    const parentType = useSelector((state) => state.auth.parentType);

    useEffect(() => {
        let ignore = false;

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
                    page: page + 1,
                    limit: rowsPerPage,
                });

                const response = await authFetch(`${USERLIST_URL}?${params.toString()}`, {
                    method: "GET",
                });

                if (response.status === 401) {
                    return;
                }

                const data = await response.json().catch(() => ({}));
                if (!ignore) {
                    setUserList(data?.data?.records || []);
                    setTotalRecords(data?.data?.total_records || 0);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            ignore = true;
        };
    }, [accessToken, userType, parentType, page, rowsPerPage]);

    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "grey.100" }}>
                                <TableCell>User ID</TableCell>
                                <TableCell>MIS ID</TableCell>
                                <TableCell>BAPS ID</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Middle Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userList.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.mis_id}</TableCell>
                                    <TableCell>{user.baps_id}</TableCell>
                                    <TableCell>{user.FirstName}</TableCell>
                                    <TableCell>{user.MiddleName}</TableCell>
                                    <TableCell>{user.LastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalRecords}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[25, 50, 100]}
                />
            </Paper>
        </Box>
    );
};

export default UserPageLists;
