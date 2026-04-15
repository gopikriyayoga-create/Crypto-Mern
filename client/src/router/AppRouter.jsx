import {createBrowserRouter} from "react-router";
import DasboardLayout from "../Layout/DasboardLayout";
import CoinPrice from "../Component/coinPrice";
import SearchCoins from "../Component/SearchCoins";
import LoginSignup from "../Component/LoginSignup";
import OverView from "../Component/OverView";
import Portfolio from "../Component/Portfolio";
import Alerts from "../Component/Alerts";
import News from "../Component/News";



const AppRouter = createBrowserRouter([
    
    {
        path: "/",
        element: <LoginSignup/>,
    },
  
    {
        path: "/dashboard",
        element: <DasboardLayout/>,
        children:[
           
              {
                path: "/dashboard/overview",
                element: <OverView/>,
              },
   
             {
                path: "/dashboard/coin-price",
                element: <CoinPrice/>,
                
            },
            {
                path: "/dashboard/Search-Coins",
                element: <SearchCoins/>,
            },
           {
            path: "/dashboard/portfolio",
            element: <Portfolio/>,
           },
           {
            path: "/dashboard/alerts",
            element: <Alerts/>,
           },
           {
            path: "/dashboard/news",
            element: <News/>,
           },
        ],
    },
]);

export default AppRouter