"use client"
import dynamic from "next/dynamic"

const BarChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.BarChart })), { ssr: false })
const Bar = dynamic(() => import("recharts").then((mod) => ({ default: mod.Bar })), { ssr: false })
const XAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.XAxis })), { ssr: false })
const YAxis = dynamic(() => import("recharts").then((mod) => ({ default: mod.YAxis })), { ssr: false })
const CartesianGrid = dynamic(() => import("recharts").then((mod) => ({ default: mod.CartesianGrid })), { ssr: false })
const Tooltip = dynamic(() => import("recharts").then((mod) => ({ default: mod.Tooltip })), { ssr: false })
const Legend = dynamic(() => import("recharts").then((mod) => ({ default: mod.Legend })), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })), {
  ssr: false,
})
const PieChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.PieChart })), { ssr: false })
const Pie = dynamic(() => import("recharts").then((mod) => ({ default: mod.Pie })), { ssr: false })
const Cell = dynamic(() => import("recharts").then((mod) => ({ default: mod.Cell })), { ssr: false })
const LineChart = dynamic(() => import("recharts").then((mod) => ({ default: mod.LineChart })), { ssr: false })
const Line = dynamic(() => import("recharts").then((mod) => ({ default: mod.Line })), { ssr: false })

interface SlideRendererProps {
  slide: any
  slideNumber: number
  totalSlides: number
}

export function SlideRenderer({ slide, slideNumber, totalSlides }: SlideRendererProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const renderChart = (chartData: any) => {
    if (!chartData || !chartData.data) return null

    switch (chartData.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={chartData.yKey || "value"} fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={chartData.valueKey || "value"}
              >
                {chartData.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chartData.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={chartData.yKey || "value"} stroke="#0088FE" />
            </LineChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const renderTable = (tableData: any) => {
    if (!tableData || !tableData.headers || !tableData.rows) return null

    return (
      <div className="overflow-auto max-h-64">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
          <thead className="sticky top-0">
            <tr className="bg-gray-100 dark:bg-gray-800">
              {tableData.headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-left font-semibold text-xs"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row: any[], rowIndex: number) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
              >
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Handle different slide types
  if (slide.type === "title") {
    return (
      <div
        className="h-full flex flex-col justify-center items-center p-8 relative"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-4xl font-bold text-amber-700 mb-2">{slide.title}</h1>
          <div className="w-64 h-1 bg-amber-600 mx-auto mb-4"></div>
          {slide.date && <p className="text-lg text-gray-600 mt-4">{slide.date}</p>}
          {slide.subtitle && <p className="text-xl text-gray-700 mt-2">{slide.subtitle}</p>}
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold tracking-wider">
          www.gmdcltd.com
        </div>
        <div className="absolute bottom-4 left-4 text-sm text-gray-600">{slideNumber}</div>
      </div>
    )
  }

  if (slide.type === "table-of-contents") {
    return (
      <div
        className="h-full p-8 flex flex-col"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Env%20PPTsENV.%20PPT%20%20%2823.01.2023%29.jpg-GzEIJX7CGTKIxusfQ5fi9SSvkA7RKs.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex justify-between items-start mb-8">
          <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" className="h-12" />
          <div className="text-right text-sm text-gray-800">www.gmdcltd.com</div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Table of Content</h2>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {slide.items &&
              slide.items.map((item: string, index: number) => (
                <div key={index} className="flex items-start mb-4 text-lg">
                  <span className="font-semibold text-blue-600 mr-4 flex-shrink-0">{index + 1}.</span>
                  <span className="text-gray-800 break-words">{item}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-sm text-gray-700">{slideNumber}</div>
      </div>
    )
  }

  if (slide.type === "thank-you") {
    return (
      <div
        className="h-full flex flex-col justify-center items-center p-8 relative"
        style={{
          backgroundImage:
            "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Main%20Slide.jpg-zFK4QxoegV9krsPbigcwKDu936VkkA.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-center">
          <div className="mb-8" style={{ marginTop: "10px" }}>
            <h1 className="text-5xl font-bold text-amber-700 mb-2">THANK YOU</h1>
            <div className="w-64 h-1 bg-amber-600 mx-auto"></div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-700 font-semibold tracking-wider">
          www.gmdcltd.com
        </div>
        <div className="absolute bottom-4 left-4 text-sm text-gray-600">{slideNumber}</div>
      </div>
    )
  }

  // Content slide
  return (
    <div
      className="h-full p-8 flex flex-col"
      style={{
        backgroundImage:
          "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Env%20PPTsENV.%20PPT%20%20%2823.01.2023%29.jpg-GzEIJX7CGTKIxusfQ5fi9SSvkA7RKs.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex justify-between items-start mb-6 flex-shrink-0">
        <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" className="h-12" />
        <div className="text-right text-sm text-gray-800">www.gmdcltd.com</div>
      </div>

      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 break-words">{slide.title}</h2>
        {slide.subtitle && <h3 className="text-lg text-gray-700 mb-4 break-words">{slide.subtitle}</h3>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {slide.content && (
          <div className="text-gray-800">
            {Array.isArray(slide.content) ? (
              <ul className="space-y-2">
                {slide.content.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2 flex-shrink-0">➢</span>
                    <span className="break-words text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="break-words text-sm leading-relaxed">{slide.content}</p>
            )}
          </div>
        )}

        {slide.chart && <div className="max-h-80">{renderChart(slide.chart)}</div>}
        {slide.table && renderTable(slide.table)}
      </div>

      <div className="absolute bottom-4 right-4 text-sm text-gray-700">{slideNumber}</div>
    </div>
  )
}
