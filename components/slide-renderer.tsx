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

const splitContentIntoSlides = (content: any[], maxItemsPerSlide = 6) => {
  const slides = []
  for (let i = 0; i < content.length; i += maxItemsPerSlide) {
    slides.push(content.slice(i, i + maxItemsPerSlide))
  }
  return slides
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
      <div className="h-full">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {tableData.headers.map((header: string, index: number) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-600 px-1 py-1 text-left font-semibold text-xs"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.slice(0, 8).map((row: any[], rowIndex: number) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
              >
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 px-1 py-1 text-xs">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.rows.length > 8 && (
          <div className="text-center text-xs text-gray-600 mt-2 italic">
            ...continued on next slide ({tableData.rows.length - 8} more rows)
          </div>
        )}
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

  if (slide.type === "thank-you" || slideNumber === totalSlides) {
    return (
      <div
        className="h-full flex flex-col justify-center items-center p-8 relative"
        style={{
          backgroundImage: "url(/content-slide-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex justify-between items-start mb-2 absolute top-4 left-4 right-4">
          <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" className="h-10" />
          <div className="text-right text-sm text-gray-800">www.gmdcltd.com</div>
        </div>

        <div className="text-center" style={{ marginTop: "10px" }}>
          <h1 className="text-6xl font-bold text-amber-700 mb-4">THANK YOU</h1>
          <div className="w-64 h-1 bg-amber-600 mx-auto"></div>
        </div>

        <div className="absolute bottom-4 right-4 text-sm text-gray-700">{slideNumber}</div>
      </div>
    )
  }

  if (slide.type === "table-of-contents") {
    return (
      <div
        className="h-full p-4 flex flex-col"
        style={{
          backgroundImage: "url(/content-slide-background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" className="h-10" />
          <div className="text-right text-sm text-gray-800">www.gmdcltd.com</div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Table of Content</h2>

        <div className="flex-1">
          <div className="max-w-4xl mx-auto h-full">
            {slide.items && slide.items.length > 10 ? (
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="space-y-3">
                  {slide.items.slice(0, Math.ceil(slide.items.length / 2)).map((item: string, index: number) => (
                    <div key={index} className="flex items-start text-base">
                      <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">{index + 1}.</span>
                      <span className="text-gray-800 break-words leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {slide.items.slice(Math.ceil(slide.items.length / 2)).map((item: string, index: number) => (
                    <div key={index + Math.ceil(slide.items.length / 2)} className="flex items-start text-base">
                      <span className="font-semibold text-blue-600 mr-3 flex-shrink-0">
                        {index + Math.ceil(slide.items.length / 2) + 1}.
                      </span>
                      <span className="text-gray-800 break-words leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {slide.items &&
                  slide.items.slice(0, 12).map((item: string, index: number) => (
                    <div key={index} className="flex items-start text-lg">
                      <span className="font-semibold text-blue-600 mr-4 flex-shrink-0">{index + 1}.</span>
                      <span className="text-gray-800 break-words leading-relaxed">{item}</span>
                    </div>
                  ))}
                {slide.items && slide.items.length > 12 && (
                  <div className="text-center text-sm text-gray-600 mt-4 italic">...continued on next slide</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 text-sm text-gray-700">{slideNumber}</div>
      </div>
    )
  }

  // Content slide
  return (
    <div
      className="h-full p-2 flex flex-col"
      style={{
        backgroundImage: "url(/content-slide-background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex justify-between items-start mb-2 flex-shrink-0">
        <img src="https://www.gmdcltd.com/assets/img/logo.jpg" alt="GMDC Logo" className="h-10" />
        <div className="text-right text-sm text-gray-800">www.gmdcltd.com</div>
      </div>

      <div className="mb-2 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-2 break-words">{slide.title}</h2>
        {slide.subtitle && <h3 className="text-base text-gray-700 mb-2 break-words">{slide.subtitle}</h3>}
      </div>

      <div className="flex-1">
        {slide.content && (
          <div className="text-gray-800 h-full">
            {Array.isArray(slide.content) ? (
              slide.content.length > 12 ? (
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="space-y-1">
                    <ul className="space-y-1">
                      {slide.content
                        .slice(0, Math.min(8, Math.ceil(slide.content.length / 2)))
                        .map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 flex-shrink-0">➢</span>
                            <span className="break-words text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <ul className="space-y-1">
                      {slide.content
                        .slice(Math.ceil(slide.content.length / 2), Math.min(16, slide.content.length))
                        .map((item: string, index: number) => (
                          <li key={index + Math.ceil(slide.content.length / 2)} className="flex items-start">
                            <span className="text-blue-600 mr-2 flex-shrink-0">➢</span>
                            <span className="break-words text-sm leading-relaxed">{item}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <ul className="space-y-2">
                    {slide.content.slice(0, 10).map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-3 flex-shrink-0">➢</span>
                        <span className="break-words text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {slide.content.length > 10 && (
                    <div className="text-center text-xs text-gray-600 mt-4 italic">
                      ...continued on next slide ({slide.content.length - 10} more items)
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="h-full">
                <p className="break-words text-sm leading-relaxed">
                  {typeof slide.content === "string" && slide.content.length > 1000
                    ? slide.content.substring(0, 1000) + "..."
                    : slide.content}
                </p>
                {typeof slide.content === "string" && slide.content.length > 1000 && (
                  <div className="text-center text-xs text-gray-600 mt-4 italic">...continued on next slide</div>
                )}
              </div>
            )}
          </div>
        )}

        {(slide.chart || slide.table) && (
          <div className="mt-2 space-y-4 h-64">
            {slide.chart && <div className="h-48">{renderChart(slide.chart)}</div>}
            {slide.table && <div className="h-48">{renderTable(slide.table)}</div>}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 text-sm text-gray-700">{slideNumber}</div>
    </div>
  )
}
