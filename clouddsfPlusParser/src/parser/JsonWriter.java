/*
 * Copyright 2015 Balduin Metz
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package parser;

import cloudDSF.CloudDSF;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Triggers parsing and serialization of clouddsf knowledge base (excel file) into two json files.
 *
 * @author Metz
 */
public class JsonWriter {
    /**
     * Retrieves knowledge base file and starts parsing as well as serialization.
     *
     * @param args length=3 we need 3 params
     *             args[0]  [in]    .xlsx file
     *             args[1]  [out]   CloudDSFJson
     *             args[2]  [out]   CloudDSFPlusJson
     * @throws IOException Reading of Excel File fails
     */
    public static void main(String[] args) throws IOException {
        // Create Workbook instance holding reference to .xlsx file
        if (args.length != 3) {
            System.out.println("-ERROR- invalid arguments");
            return;
        }

        try {
            String xlsxFilePath = args[0];
            File xlsxFile = new File(xlsxFilePath);
            FileInputStream in = new FileInputStream(xlsxFile);

            XSSFWorkbook workbook = new XSSFWorkbook(in);

            writeCloudDSFPlusJson(workbook, args[2]);

            System.out.println("-INFO- Finished");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Creates json file for the cloudDSFPlus with all new attributes.
     *
     * @param workbook
     * @param cloudDSFPlusJsonFile
     * @throws JsonGenerationException
     * @throws JsonMappingException
     * @throws IOException
     */
    private static void writeCloudDSFPlusJson(XSSFWorkbook workbook, String cloudDSFPlusJsonFile) throws
            IOException {
        // instantiate parser for CloudDSFPlus and read excel
        CloudDSFPlusParser cloudDSFPlusParser = new CloudDSFPlusParser(workbook);

        //LOG
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("CloudDSFPlusParser");
        System.out.println("--------------------------------------------------------------------------------");
        //LOG

        CloudDSF cdsf = cloudDSFPlusParser.readExcel();
        // check the internal consistency and if successfull serialize data
        if (cdsf.checkSanity()) {
            // Helper Method
            // cdsf.printCloudDSF();
            // Jackson objectmapper and settings
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            // Ignore missing getters to serialize all values
            mapper.setVisibility(mapper.getSerializationConfig().getDefaultVisibilityChecker()
                    .withFieldVisibility(JsonAutoDetect.Visibility.ANY)
                    .withGetterVisibility(JsonAutoDetect.Visibility.NONE));
            mapper.setSerializationInclusion(Include.NON_NULL);
            // create json structure
            JsonNode rootNode = mapper.createObjectNode();
            ((ObjectNode) rootNode).putPOJO("cdsfPlus", cdsf);
            ((ObjectNode) rootNode).putPOJO("links", cdsf.getInfluencingDecisions());
            ((ObjectNode) rootNode).putPOJO("outcomeLinks", cdsf.getInfluencingOutcomes());
            // Serialize CloudDSFPlus into json file
            File file = new File(cloudDSFPlusJsonFile);
            mapper.writeValue(file, rootNode);
            System.out.println("Knowledge Base has been successfully verified and exported");
        } else {
            // knowledge base is not valid abort serialization
            System.out.println("The knowledge base is not valid");
        }
    }
}
