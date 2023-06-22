import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useRecoilState } from "recoil";
import { eventState } from '../../redux/store/Event/event';
import { useState, MouseEvent } from "react";
import { Event } from '../../redux/domain/eventList';
import Box from '@mui/material/Box';
import { Button, ThemeProvider } from "@mui/material";
import { eventTheme } from '../../entries/theme';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import HeaderPage from '../../components/Header/HeaderPage';
import DeleteModalBox from '../ModalBox/DeleteModalBox';
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVertTwoTone } from "@mui/icons-material";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImportButton from "./ImportButton";
import ExportButton from '../ExportButton';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: eventTheme.palette.info.dark
  },
  '& th': {
    color: eventTheme.palette.text.secondary
  },
  '& td:hover' : {
    color: eventTheme.palette.text.secondary
  }
}));

const EventPage:React.FC<{
  children?: React.ReactNode;
}> = () => {
  const navigate = useNavigate();
  const [events, setEventState] = useRecoilState(eventState);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /* Start Create Modal Box */
  const [isDeleteModal, setIsDeleteModal] = React.useState(false);
  /* Start Create Modal Box */
  const [selectedUser, setSelectedUser] = React.useState<Event | null>(null);

  const data = events.data;

  const pageNums = [1, 2, 3, 4, 5];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  /**
   * icon button click show edit modal small box
   * @param event
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  /**
   * close the modal box for icon click
   */
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  /**
   * close edit modl box when close button clicked
   */
  const handlDeleteModalClose = () => {
    setIsDeleteModal(false);
  };

  /**
   *  show delete modal dialog
   * @param data for selected user
   */
  const handleDeleteClick = (data: Event) => {
    setSelectedUser(data);
    setIsDeleteModal(true);
    handleClose();
  };

  /**
   *  Delete the selected users
   */
  const handleConfirmDelete = () => {
    if(selectedUser) {
      handleClose();
      axios.delete('http://localhost:8000/api/event/delete/' + selectedUser.id).then(response => {
        window.location.reload();
      })
    }
  };

  /**
   *  To Change the status is approved or rejected
   */
  const changeStatus = (id: string | number, status: string) => {
    let preEventList = [...events.data];
    const index = preEventList.findIndex((event: { id: string | number; }) => event.id === id);

    const event_list_data = preEventList.filter(event =>event.id === id)[0];
    
    preEventList[index] = {
      ...preEventList[index],
      status: status
    };

    const param = {
      event_name: preEventList[index].event_name,
      description: preEventList[index].description,
      from_date: preEventList[index].from_date,
      to_date: preEventList[index].to_date,
      from_time: preEventList[index].from_time,
      to_time: preEventList[index].to_time,
      status: status,
      address: preEventList[index].address,
      approved_by_user_id: preEventList[index].approved_by_user_id,
    }

    axios.post('http://localhost:8000/api/event/update/' + id, param).then((response) => {
      if(response.status === 200) {
        const temp: any = {
          data: preEventList
        };
        setEventState({
          ...temp
        })
      }
    })
    if(status == 'approved'){
      // To send message to Line 
      // sentLineMessage(event_list_data);
      console.log(status)
      // To Send Message to Skype
      const message = 'Your request has been approved!';
      sendMessageToSkype(message);
    }
  };

  const sentLineMessage = (event_list_data: { id: string | Blob; address: string | Blob; approved_by_user_id: string | Blob; description: string | Blob; event_name: string | Blob; from_date: string | Blob; from_time: string | Blob; image: string | Blob; phone: string | Blob; }) =>{
    let formData = new FormData();
    formData.append('id', event_list_data.id);
    formData.append('address', event_list_data.address);
    formData.append('approved_by_user_id', event_list_data.approved_by_user_id);
    formData.append('description', event_list_data.description);
    formData.append('event_name', event_list_data.event_name);
    formData.append('from_date', event_list_data.from_date);
    formData.append('from_time', event_list_data.from_time);
    formData.append('image', event_list_data.image);
    axios.post('http://localhost:8000/api/line/webhook/message',formData).then(() => {
      console.log('line message send successfully');
    }).catch((error) => {
      console.log(`error message ${error}`);
    });
  };

  // Function to send a message
  const sendMessageToSkype = (message: string) => {
    // Initialize the Skype SDK

    axios.post('http://localhost:8000/api/skype/message', {message}).then(() => {
      console.log('Skype message send successfully');
    }).catch((error) => {
      console.log(`error message ${error}`);
    });
  };

  const styles = {
    modalScroll: {
      overflow: 'scroll',
    },
    submitButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      background: '#d41616',
      color: '#e6f2ff',
      cursor: 'pointer',
    },
    clearbutton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      color: '#e6f2ff',
      background: '#1a8cff',
      cursor: 'pointer',
    },
    imageStyle: {
      width: '50px',
    },
    paginateStyle: {
      padding: '4px 10px 0 10px',
      border: '1px solid #bdbdbe',
    }
  }

  return (
    <div>
        <HeaderPage />
        <ThemeProvider theme={eventTheme}>
          <Box sx={{
              width: '100%',
              backgroundColor: '#4e7294'
          }}>
            <Box sx={{ px: 5, py: 5 }}>
              <Box sx={{pb: 3, textAlign: 'end', display: 'flex', justifyContent: 'space-between'}}>
                  <ImportButton />
                </div>
                <div>
                  <ExportButton data={data} filename="eventLists_data"/>
                  <Button sx={{color: 'white', border: '2px solid #52ea52', background: '#35c4358c'}} onClick={() => navigate('/admin/event/create')}>Create</Button>
                </div>
              </Box>
              <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <StyledTableRow sx={{backgroundColor: '#80bfff'}}>
                        <TableCell>ID</TableCell>
                        <TableCell align="center" color='#e6f2ff'>Image</TableCell>
                        <TableCell align="center" color='#e6f2ff'>Event Name</TableCell>
                        <TableCell align="center" color='#e6f2ff'>Description</TableCell>
                        <TableCell align="center" color='#e6f2ff'>Address</TableCell>
                        <TableCell align="center" color='#e6f2ff'>Feedback</TableCell>
                        <TableCell align="center" color='#e6f2ff'></TableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                    {currentData.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell component="th" scope="row">
                          {row.id}
                        </TableCell>
                        <TableCell align="center" component="th" scope="row">
                          <img
                            src={
                              "http://localhost:8000/" +
                              row.image +
                              "?auto=format&fit=crop&w=800"
                            }
                            srcSet={
                              "http://localhost:8000/" +
                              row.image +
                              "?auto=format&fit=crop&w=800&dpr=2 2x"
                            }
                            alt={row.event_name}
                            loading="lazy"
                            style={styles.imageStyle}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Link to={`/admin/event/edit/${row.id}`} style={{ color: '#393939'}}>{row.event_name}</Link>
                        </TableCell>
                        <TableCell align="center">{row.description}</TableCell>
                        <TableCell align="center">
                          {row.address}
                        </TableCell>
                        <TableCell align="center">
                          {(row.status === 'new' || row.status === 'rejected') &&
                            <IconButton 
                              sx={{ color: '#0072ff'}}
                              onClick={() =>
                                changeStatus(row.id, 'approved')}
                            >
                              <ThumbUpIcon/> 
                            </IconButton> ||
                            <a href='skype:live:.cid.1ed9002627da4bb3?chat'>Chat</a>
                          }
                          {(row.status === 'new' || row.status === 'approved') &&
                            <IconButton
                              sx={{ color: '#d22727'}}
                              onClick={() =>
                              changeStatus(row.id, 'rejected')}
                            >
                              <ThumbDownIcon/>
                            </IconButton> 
                          }
                          {/* {
                            (chat == true && row.status === 'approved') &&
                            <a href='skype:live:.cid.1ed9002627da4bb3?chat'>Chat</a>
                          } */}
                          
                        </TableCell>
                        <TableCell align="right" key={row.id}> 
                          <IconButton
                            aria-controls={`menu-${row.id}`}
                            aria-handleSubmit="true"
                            onClick={(event) => handleClick(event, row?.id.toString())}
                          >
                            <MoreVertTwoTone />
                          </IconButton>
                          <Menu
                            id={`menu-${row.id}`}
                            anchorEl={anchorEl}
                            open={selectedId ? parseInt(selectedId) === row.id : false}
                            onClose={handleClose}
                          >
                            <MenuItem onClick={() => navigate(`/admin/event/edit/${row.id}`)}>Edit</MenuItem>
                            <MenuItem onClick={() => handleDeleteClick(row)}>Delete</MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
              </TableContainer>
              <Box sx={{ 
                pt: 3,
                display: "flex",
                justifyContent: "center"
              }}>
                <button style={styles.paginateStyle} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  <KeyboardDoubleArrowLeftIcon/>
                </button>
                {pageNums.map((pageNum: number, idx: React.Key | null | undefined) => (
                  pageNum <= totalPages ? (
                    <button
                      onClick={() => setCurrentPage(pageNum)} 
                      key={idx} 
                      disabled={isNaN(pageNum)}
                      style={{
                        ...styles.paginateStyle,
                        backgroundColor: currentPage === pageNum ? '#7baee6ba' : ''
                      }}
                    >
                      {pageNum}
                    </button>
                  ) : null
                ))}
                <button style={styles.paginateStyle} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <KeyboardDoubleArrowRightIcon/>
                </button>
              </Box>
            </Box>
        </Box>
        <DeleteModalBox
          isOpen={isDeleteModal}
          onClose={handlDeleteModalClose}
          aria-labelledby="modal-modal-title"
        >
        <h1>Delete User</h1>
        <p>Are you sure you want to delete this event ?</p>
        <div style={{display: "flex", justifyContent: "space-evenly", marginBottom: "20px", marginTop: "30px"}}>
          <button type="reset" style={styles.clearbutton} onClick={handlDeleteModalClose}>Close</button>
          <button style={styles.submitButton} type="submit" onClick={handleConfirmDelete}>Confirm Delete</button>
        </div>
      </DeleteModalBox>
      </ThemeProvider>
    </div>
  );
};

export default EventPage;