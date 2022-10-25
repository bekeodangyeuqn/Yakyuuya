import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  navBar: {
    backgroundColor: "#203040",
    "& a": {
      color: "#ffffff",
      marginLeft: 10,
    },
  },
  brand: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  grow: {
    flexGrow: 1,
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  main: {
    minHeight: "80vh",
  },
  footer: {
    textAlign: "center",
    marinTop: 10,
  },
  form: {
    width: "100%",
    margin: "0 auto",
    maxWidth: "800px",
  },
  navBarBtn: {
    color: "#ffffff",
    textTransform: "initial",
  },
  transparentBackground: {
    backgroundColor: "transparent",
  },
  error: {
    color: "#f04040",
  },
  fullWidth: {
    width: "100%",
  },
  reviewItem: {
    marginRight: "10px",
    paddingRight: "10px",
    borderRight: "1px solid black",
  },
  toolbar: {
    justifyContent: "space-between",
  },
  menuButton: { padding: 0 },
  // search
  searchSection: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  searchForm: {
    border: "1px solid #ffffff",
    backgroundColor: "#ffffff",
    borderRadius: 5,
  },
  searchInput: {
    paddingLeft: 5,
    color: "#000000",
    "& ::placeholder": {
      color: "#606060",
    },
  },
  iconButton: {
    backgroundColor: "#f000b8",
    padding: 5,
    borderRadius: "0 5px 5px 0",
    "& span": {
      color: "#000000",
    },
  },
  mt5: {
    marginTop: "5px",
  },
}));

export default useStyles;
