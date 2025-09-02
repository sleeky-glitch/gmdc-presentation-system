export async function POST(request: Request) {
  try {
    console.log("[v0] Starting PowerPoint generation with corrected structure...")

    const data = await request.json()
    console.log("[v0] Received data:", JSON.stringify(data, null, 2))

    const { default: PizZip } = await import("pizzip")
    console.log("[v0] PizZip imported successfully")

    // Create PowerPoint structure
    const zip = new PizZip()

    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  ${data.slides
    ?.map(
      (_: any, index: number) =>
        `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`,
    )
    .join("\n  ")}
</Types>`,
    )

    zip.file(
      "_rels/.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    )

    zip.file(
      "docProps/core.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${data.title || "GMDC Presentation"}</dc:title>
  <dc:creator>GMDC</dc:creator>
  <cp:lastModifiedBy>GMDC</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`,
    )

    zip.file(
      "docProps/app.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>GMDC Presentation System</Application>
  <ScaleCrop>false</ScaleCrop>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>1.0</AppVersion>
  <Slides>${data.slides?.length || 0}</Slides>
  <PresentationFormat>On-screen Show (16:9)</PresentationFormat>
</Properties>`,
    )

    // Add slides
    const createSlideXML = (slide: any, index: number) => {
      const slideId = index + 1

      if (slide.type === "title") {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </a:blipFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="ctrTitle"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="5486400"/>
            <a:ext cx="7315200" cy="1371600"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="en-US" sz="4400" b="1">
                <a:solidFill>
                  <a:srgbClr val="B8860B"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slide.title || data.title}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Divider"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="3657600" y="6858000"/>
            <a:ext cx="1828800" cy="91440"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
          <a:solidFill>
            <a:srgbClr val="B8860B"/>
          </a:solidFill>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p/>
        </p:txBody>
      </p:sp>
      ${
        slide.subtitle
          ? `<p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Subtitle"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="subTitle" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="7315200"/>
            <a:ext cx="7315200" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="en-US" sz="2400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slide.subtitle}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`
          : ""
      }
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="5" name="Website"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="3657600" y="8686800"/>
            <a:ext cx="1828800" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="en-US" sz="1600" b="1">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>www.gmdcltd.com</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
      } else if (slide.type === "thank-you" || slideId === data.slides?.length) {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:blipFill>
          <a:blip r:embed="rId3"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </a:blipFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="GMDC Logo"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="457200"/>
            <a:ext cx="914400" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>GMDC</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Website"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="7315200" y="457200"/>
            <a:ext cx="1371600" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>www.gmdcltd.com</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Thank You"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="1828800" y="4114800"/>
            <a:ext cx="5486400" cy="1828800"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="en-US" sz="6600" b="1">
                <a:solidFill>
                  <a:srgbClr val="B8860B"/>
                </a:solidFill>
              </a:rPr>
              <a:t>THANK YOU</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="5" name="Divider"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="3657600" y="5943600"/>
            <a:ext cx="1828800" cy="91440"/>
          </a:xfrm>
          <a:prstGeom prst="rect">
            <a:avLst/>
          </a:prstGeom>
          <a:solidFill>
            <a:srgbClr val="B8860B"/>
          </a:solidFill>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p/>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="6" name="Slide Number"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="8229600" y="8686800"/>
            <a:ext cx="457200" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slideId}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
      } else if (slide.type === "table-of-contents") {
        let contentItems = ""
        if (slide.items && Array.isArray(slide.items)) {
          if (slide.items.length > 10) {
            // Two column layout
            const midPoint = Math.ceil(slide.items.length / 2)
            const leftItems = slide.items.slice(0, midPoint)
            const rightItems = slide.items.slice(midPoint)

            contentItems =
              leftItems
                .map((item: string, index: number) => `${index + 1}. ${item.replace(/^\d+\.\s*/, "")}`)
                .join("\n") +
              "\n\n" +
              rightItems
                .map((item: string, index: number) => `${index + midPoint + 1}. ${item.replace(/^\d+\.\s*/, "")}`)
                .join("\n")
          } else {
            // Single column layout
            contentItems = slide.items
              .slice(0, 12)
              .map((item: string, index: number) => `${index + 1}. ${item.replace(/^\d+\.\s*/, "")}`)
              .join("\n")
          }
        }

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:blipFill>
          <a:blip r:embed="rId3"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </a:blipFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="GMDC Logo"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="457200"/>
            <a:ext cx="914400" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>GMDC</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Website"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="7315200" y="457200"/>
            <a:ext cx="1371600" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>www.gmdcltd.com</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="1371600"/>
            <a:ext cx="7315200" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="ctr"/>
            <a:r>
              <a:rPr lang="en-US" sz="2800" b="1">
                <a:solidFill>
                  <a:srgbClr val="1F4E79"/>
                </a:solidFill>
              </a:rPr>
              <a:t>Table of Content</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="5" name="Content"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="914400" y="2286000"/>
            <a:ext cx="7315200" cy="5486400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1800">
                <a:solidFill>
                  <a:srgbClr val="333333"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${contentItems}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="6" name="Slide Number"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="8229600" y="8686800"/>
            <a:ext cx="457200" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slideId}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
      } else {
        let contentText = ""
        if (Array.isArray(slide.content)) {
          if (slide.content.length > 12) {
            // Two column layout with bullet points
            const midPoint = Math.ceil(slide.content.length / 2)
            const leftItems = slide.content.slice(0, Math.min(8, midPoint))
            const rightItems = slide.content.slice(midPoint, Math.min(16, slide.content.length))

            contentText =
              leftItems.map((item: string) => `➢ ${item}`).join("\n") +
              "\n\n" +
              rightItems.map((item: string) => `➢ ${item}`).join("\n")
          } else {
            // Single column with bullet points
            contentText = slide.content
              .slice(0, 10)
              .map((item: string) => `➢ ${item}`)
              .join("\n")
          }
        } else if (typeof slide.content === "string") {
          contentText = slide.content.length > 1000 ? slide.content.substring(0, 1000) + "..." : slide.content
        }

        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:blipFill>
          <a:blip r:embed="rId3"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </a:blipFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="GMDC Logo"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="182880"/>
            <a:ext cx="914400" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>GMDC</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Website"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="7315200" y="182880"/>
            <a:ext cx="1371600" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>www.gmdcltd.com</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="4" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="1188720"/>
            <a:ext cx="6400800" cy="914400"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="2400" b="1">
                <a:solidFill>
                  <a:srgbClr val="1F4E79"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slide.title}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      ${
        slide.subtitle
          ? `<p:sp>
        <p:nvSpPr>
          <p:cNvPr id="5" name="Subtitle"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="457200" y="2103120"/>
            <a:ext cx="6400800" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1800">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slide.subtitle}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>`
          : ""
      }
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="6" name="Content"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="182880" y="${slide.subtitle ? "2743200" : "2286000"}"/>
            <a:ext cx="8686800" cy="${slide.subtitle ? "4800600" : "5257800"}"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="1600">
                <a:solidFill>
                  <a:srgbClr val="333333"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${contentText}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="7" name="Slide Number"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="8229600" y="8686800"/>
            <a:ext cx="457200" cy="457200"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:r>
              <a:rPr lang="en-US" sz="1400">
                <a:solidFill>
                  <a:srgbClr val="666666"/>
                </a:solidFill>
              </a:rPr>
              <a:t>${slideId}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>`
      }
    }

    data.slides?.forEach((slide: any, index: number) => {
      const slideId = index + 1
      let relationships = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout${slide.type === "title" ? "1" : "2"}.xml"/>`

      if (slide.type === "title") {
        relationships += `
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/title-background.jpg"/>`
      } else {
        relationships += `
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/content-background.png"/>`
      }

      relationships += `
</Relationships>`

      zip.file(`ppt/slides/_rels/slide${slideId}.xml.rels`, relationships)
    })

    zip.file(
      "ppt/media/title-background.jpg",
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
      { base64: true },
    )
    zip.file(
      "ppt/media/content-background.png",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      { base64: true },
    )

    zip.file(
      "ppt/presentation.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${data.slides
      ?.map((_: any, index: number) => `<p:sldId id="${256 + index}" r:id="rId${index + 3}"/>`)
      .join("\n    ")}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen16x9"/>
  <p:notesSz cx="6858000" cy="9144000"/>
  <p:defaultTextStyle>
    <a:defPPr>
      <a:defRPr lang="en-US"/>
    </a:defPPr>
  </p:defaultTextStyle>
</p:presentation>`,
    )

    zip.file(
      "ppt/_rels/presentation.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
  ${data.slides
    ?.map(
      (_: any, index: number) =>
        `<Relationship Id="rId${index + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`,
    )
    .join("\n  ")}
</Relationships>`,
    )

    zip.file(
      "ppt/slideMasters/_rels/slideMaster1.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>`,
    )

    zip.file(
      "ppt/slideLayouts/slideLayout2.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="obj" preserve="1">
  <p:cSld name="Title and Content">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="title"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content Placeholder 2"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`,
    )

    zip.file(
      "ppt/slideLayouts/_rels/slideLayout2.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
    )

    zip.file(
      "ppt/slideMasters/slideMaster1.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
    <p:sldLayoutId id="2147483650" r:id="rId2"/>
  </p:sldLayoutIdLst>
  <p:txStyles>
    <p:titleStyle>
      <a:lvl1pPr>
        <a:defRPr sz="4400" kern="1200">
          <a:solidFill>
            <a:schemeClr val="tx1"/>
          </a:solidFill>
          <a:latin typeface="+mj-lt"/>
          <a:ea typeface="+mj-ea"/>
          <a:cs typeface="+mj-cs"/>
        </a:defRPr>
      </a:lvl1pPr>
    </p:titleStyle>
    <p:bodyStyle>
      <a:lvl1pPr marL="342900" indent="-342900">
        <a:defRPr sz="2800">
          <a:solidFill>
            <a:schemeClr val="tx1"/>
          </a:solidFill>
          <a:latin typeface="+mn-lt"/>
          <a:ea typeface="+mn-ea"/>
          <a:cs typeface="+mn-cs"/>
        </a:defRPr>
      </a:lvl1pPr>
    </p:bodyStyle>
    <p:otherStyle>
      <a:defPPr>
        <a:defRPr lang="en-US"/>
      </a:defPPr>
    </p:otherStyle>
  </p:txStyles>
</p:sldMaster>`,
    )

    zip.file(
      "ppt/slideLayouts/slideLayout1.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sldLayout>`,
    )

    zip.file(
      "ppt/slideLayouts/_rels/slideLayout1.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`,
    )

    zip.file(
      "ppt/theme/theme1.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1>
        <a:sysClr val="windowText" lastClr="000000"/>
      </a:dk1>
      <a:lt1>
        <a:sysClr val="window" lastClr="FFFFFF"/>
      </a:lt1>
      <a:dk2>
        <a:srgbClr val="1F497D"/>
      </a:dk2>
      <a:lt2>
        <a:srgbClr val="EEECE1"/>
      </a:lt2>
      <a:accent1>
        <a:srgbClr val="4F81BD"/>
      </a:accent1>
      <a:accent2>
        <a:srgbClr val="F79646"/>
      </a:accent2>
      <a:accent3>
        <a:srgbClr val="9BBB59"/>
      </a:accent3>
      <a:accent4>
        <a:srgbClr val="8064A2"/>
      </a:accent4>
      <a:accent5>
        <a:srgbClr val="4BACC6"/>
      </a:accent5>
      <a:accent6>
        <a:srgbClr val="F366A7"/>
      </a:accent6>
      <a:hlink>
        <a:srgbClr val="0000FF"/>
      </a:hlink>
      <a:folHlink>
        <a:srgbClr val="800080"/>
      </a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont>
        <a:latin typeface="Calibri"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Calibri"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="50000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="35000">
              <a:schemeClr val="phClr">
                <a:tint val="37000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:tint val="15000"/>
                <a:satMod val="350000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="1"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:shade val="51000"/>
                <a:satMod val="130000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="80000">
              <a:schemeClr val="phClr">
                <a:shade val="93000"/>
                <a:satMod val="130000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="94000"/>
                <a:satMod val="135000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:lin ang="16200000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="9525" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr">
              <a:shade val="95000"/>
              <a:satMod val="105000"/>
            </a:schemeClr>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
        <a:ln w="25400" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr"/>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
        <a:ln w="38100" cap="flat" cmpd="sng" algn="ctr">
          <a:solidFill>
            <a:schemeClr val="phClr"/>
          </a:solidFill>
          <a:prstDash val="solid"/>
        </a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="38000"/>
              </a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="35000"/>
              </a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0">
              <a:srgbClr val="000000">
                <a:alpha val="35000"/>
              </a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
          <a:scene3d>
            <a:camera prst="orthographicFront">
              <a:rot lat="0" lon="0" rev="0"/>
            </a:camera>
            <a:lightRig rig="threePt" dir="t">
              <a:rot lat="0" lon="0" rev="1200000"/>
            </a:lightRig>
          </a:scene3d>
          <a:sp3d>
            <a:bevelT w="63500" h="25400"/>
          </a:sp3d>
        </a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill>
          <a:schemeClr val="phClr"/>
        </a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="40000"/>
                <a:satMod val="350000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="40000">
              <a:schemeClr val="phClr">
                <a:tint val="45000"/>
                <a:shade val="99000"/>
                <a:satMod val="350000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="20000"/>
                <a:satMod val="255000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:path path="circle">
            <a:fillToRect l="50000" t="-80000" r="50000" b="180000"/>
          </a:path>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0">
              <a:schemeClr val="phClr">
                <a:tint val="80000"/>
                <a:satMod val="300000"/>
              </a:schemeClr>
            </a:gs>
            <a:gs pos="100000">
              <a:schemeClr val="phClr">
                <a:shade val="30000"/>
                <a:satMod val="200000"/>
              </a:schemeClr>
            </a:gs>
          </a:gsLst>
          <a:path path="circle">
            <a:fillToRect l="50000" t="50000" r="50000" b="50000"/>
          </a:path>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`,
    )

    console.log("[v0] PowerPoint structure created, generating buffer...")

    const buffer = zip.generate({ type: "nodebuffer" })
    console.log("[v0] PowerPoint generation completed with corrected structure")

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${data.title || "presentation"}.pptx"`,
        "Content-Length": buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    return new Response(
      JSON.stringify({
        error: "PowerPoint generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
