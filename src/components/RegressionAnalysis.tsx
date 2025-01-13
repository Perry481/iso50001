interface RegressionAnalysisProps {
  data: {
    quadratic?: {
      a: number;
      b: number;
      c: number;
      y: string;
      rSquare: number;
    };
    linear: {
      X1Label: string;
      X2Label: string;
      X3Label: string;
      X1Coefficient: number;
      X2Coefficient: number;
      X3Coefficient: number;
      constant: number;
      equation: string;
      rSquare: number;
      MBE: number;
      MBEPercentage: number;
      MAE: number;
      MAEPercentage: number;
      RMSE: number;
      CvRMSE: number;
      maxError: number;
    };
  };
}

export function RegressionAnalysis({ data }: RegressionAnalysisProps) {
  return (
    <div className="space-y-4">
      {data.quadratic && (
        <div className="space-y-2">
          <div className="grid grid-cols-[180px_1fr] gap-x-8 gap-y-3 text-sm leading-7">
            <div className="whitespace-nowrap">影響因素</div>
            <div className="text-red-600">X1</div>
            <div className="whitespace-nowrap">a</div>
            <div className="text-red-600">{data.quadratic.a.toFixed(3)}</div>
            <div className="whitespace-nowrap">b</div>
            <div className="text-red-600">{data.quadratic.b.toFixed(4)}</div>
            <div className="whitespace-nowrap">c</div>
            <div className="text-red-600">{data.quadratic.c.toFixed(3)}</div>
            <div className="whitespace-nowrap">y</div>
            <div className="text-red-600">{data.quadratic.y}</div>
            <div className="whitespace-nowrap">rSquare</div>
            <div className="text-red-600">
              {data.quadratic.rSquare.toFixed(3)}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-sm font-medium">影響因素</div>
        <div className="text-sm mb-2 space-y-3 leading-7">
          <div>{data.linear.X1Label}</div>
          <div>{data.linear.X2Label}</div>
          <div>{data.linear.X3Label}</div>
        </div>
        <div className="grid grid-cols-[180px_1fr] gap-x-8 gap-y-3 text-sm leading-7">
          <div className="whitespace-nowrap">X1斜率</div>
          <div className="text-red-600">
            {data.linear.X1Coefficient.toFixed(4)}
          </div>
          <div className="whitespace-nowrap">X2斜率</div>
          <div className="text-red-600">
            {data.linear.X2Coefficient.toFixed(4)}
          </div>
          <div className="whitespace-nowrap">X3斜率</div>
          <div className="text-red-600">
            {data.linear.X3Coefficient.toFixed(4)}
          </div>
          <div className="whitespace-nowrap">截距</div>
          <div className="text-red-600">{data.linear.constant.toFixed(4)}</div>
          <div className="whitespace-nowrap">預測公式</div>
          <div className="text-red-600">{data.linear.equation}</div>
          <div className="whitespace-nowrap">RSquare</div>
          <div className="text-red-600">{data.linear.rSquare.toFixed(4)}</div>
          <div className="whitespace-nowrap">MBE (均偏差誤差)</div>
          <div className="text-red-600">{data.linear.MBE.toExponential(8)}</div>
          <div className="whitespace-nowrap">平均偏差誤差比</div>
          <div className="text-red-600">
            {data.linear.MBEPercentage.toFixed(4)}%
          </div>
          <div className="whitespace-nowrap">MAE (平均絕對誤差)</div>
          <div className="text-red-600">{data.linear.MAE.toFixed(12)}</div>
          <div className="whitespace-nowrap">平均絕對誤差比</div>
          <div className="text-red-600">
            {data.linear.MAEPercentage.toFixed(4)}%
          </div>
          <div className="whitespace-nowrap">RMSE (均方根誤差)</div>
          <div className="text-red-600">{data.linear.RMSE.toFixed(4)}</div>
          <div className="whitespace-nowrap">Cv(RMSE)</div>
          <div className="text-red-600">{data.linear.CvRMSE.toFixed(4)}%</div>
          <div className="whitespace-nowrap">(均方根誤差變異係數)</div>
          <div></div>
          <div className="whitespace-nowrap">最大誤差比(M-S)/S</div>
          <div className="text-red-600">{data.linear.maxError.toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}
