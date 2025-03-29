import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { statistical } from "../../actions/orderActions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import "./Sale.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
const Sale = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue in the last 7 days",
      },
    },
  };
  let labels = [];
  let dataset = [];
  const dispatch = useDispatch();
  const { loading, error, sale } = useSelector((state) => state.sale);
  useEffect(() => {
    dispatch(statistical());
  }, [dispatch]);
  return (
    <div className="sale-container">
      <div className="container pt-5">
        <h1>Sale</h1>
        <div className="chart-sale">
          <Line
            options={options}
            data={{
              labels: sale && sale.length > 0 ? sale.map((item) => item.date) : [],
              datasets: [
                {
                  label: "Revenue",
                  data: sale && sale.length > 0 ? sale.map((item) => item.revenue) : [],
                  borderColor: 'rgb(53, 162, 235)',
                  backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sale;
