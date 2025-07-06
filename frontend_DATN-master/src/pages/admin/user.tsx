import DataTable from "@/components/client/data-table";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchUser } from "@/redux/slice/userSlide";
import { IUser } from "@/types/backend";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callDeleteUser } from "@/config/api";
import queryString from 'query-string';
import ModalUser from "@/components/admin/user/modal.user";
import ViewDetailUser from "@/components/admin/user/view.user";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserPage = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState<IUser | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.user.isFetching);
    const meta = useAppSelector(state => state.user.meta);
    const users = useAppSelector(state => state.user.result);
    const dispatch = useAppDispatch();

    const handleDeleteUser = async (_id: string | undefined) => {
        if (_id) {
            const res = await callDeleteUser(_id);
            if (res && res.data) {
                message.success('Xóa người dùng thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IUser>[] = [
        {
            title: 'Tên User',
            dataIndex: 'name',
            sorter: true,
            fieldProps: {
                placeholder: 'Nhập tên',
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            sorter: true,
            fieldProps: {
                placeholder: 'Nhập email',
            },
        },
        {
            title: 'Công ty',
            dataIndex: ['company', 'name'],
            sorter: true,
            render: (_text, record) => record.company?.name || '—',
            fieldProps: {
              placeholder: 'Nhập công ty',
            },
            hideInSearch: true,
        },
        {
            title: 'Vai trò',
            dataIndex: ["role", "name"],
            sorter: true,
            fieldProps: {
                placeholder: 'Nhập vai trò',
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Hành động',
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <Access
                        permission={ALL_PERMISSIONS.USERS.UPDATE}
                        hideChildren
                    >
                        <EditOutlined
                            style={{
                                fontSize: 20,
                                color: '#ffa500',
                            }}
                            type=""
                            onClick={() => {
                                setOpenModal(true);
                                setDataInit(entity);
                            }}
                        />
                    </Access>

                    <Access
                        permission={ALL_PERMISSIONS.USERS.DELETE}
                        hideChildren
                    >
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa người dùng"}
                            description={"Bạn có chắc chắn muốn xóa người dùng này ?"}
                            onConfirm={() => handleDeleteUser(entity._id)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <span style={{ cursor: "pointer", margin: "0 10px" }}>
                                <DeleteOutlined
                                    style={{
                                        fontSize: 20,
                                        color: '#ff4d4f',
                                    }}
                                />
                            </span>
                        </Popconfirm>
                    </Access>
                </Space>
            ),

        },
        {
            title: '',
            dataIndex: '_id',
            width: 100,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        Chi tiết
                    </a>
                )
            },
            hideInSearch: true,
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.name) clone.name = `/${clone.name}/i`;
        if (clone.email) clone.email = `/${clone.email}/i`;

        let temp = queryString.stringify(clone);

        let sortBy = "";
        if (sort && sort.name) {
            sortBy = sort.name === 'ascend' ? "sort=name" : "sort=-name";
        }
        if (sort && sort.email) {
            sortBy = sort.email === 'ascend' ? "sort=email" : "sort=-email";
        }
        if (sort && sort.createdAt) {
            sortBy = sort.createdAt === 'ascend' ? "sort=createdAt" : "sort=-createdAt";
        }
        if (sort && sort.updatedAt) {
            sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt" : "sort=-updatedAt";
        }

        //mặc định sort theo updatedAt
        if (Object.keys(sortBy).length === 0) {
            temp = `${temp}&sort=-updatedAt`;
        } else {
            temp = `${temp}&${sortBy}`;
        }
        temp += "&populate=role&fields=role._id, role.name";

        return temp;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
            >
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách Người dùng"
                    rowKey="_id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={users}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchUser({ query }))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.current,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        const exportToExcel = () => {
                                                    // Chuyển đổi dữ liệu để export (có thể lọc trường nếu cần)
                                                    const exportData = users.map((user, index) => ({
                                                        STT: index + 1 + (meta.current - 1) * meta.pageSize,
                                                        "Tên người dùng": user.name,
                                                        "Email người dùng": user.email,
                                                        "Tuổi": user.age,
                                                        "Giới tính": user.gender,
                                                        "Địa chỉ": user.address,
                                                        "Role": (user.role as { _id: string; name: string })?.name || '',
                                                    }));
                        
                                                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                        
                                                    const workbook = XLSX.utils.book_new();
                                                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
                                                
                                                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                                                    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
                                                    saveAs(blob, 'Danh_sach_Users.xlsx');
                                                };
                        return (
                            <>
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    onClick={() => setOpenModal(true)}
                                >
                                    Thêm mới
                                </Button>
                                <Button
                                    style={{ marginLeft: 8 }}
                                    onClick={exportToExcel}
                                >
                                    Xuất Excel
                                </Button>
                            </>
                        );
                    }}
                />
            </Access>
            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ViewDetailUser
                onClose={setOpenViewDetail}
                open={openViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    )
}

export default UserPage;