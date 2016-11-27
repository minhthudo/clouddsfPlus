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

package cloudDSF;

/**
 * Represents an outcome of the cloudDSF(Plus).
 *
 * @author Metz
 */

public class Outcome extends CloudDSFEntity {

    /**
     * URL link
     */
    private String url;

    /**
     * service type information
     */
    private String serviceType;

    /**
     * Outcome constructor for the cloudDSFPlus.
     *  @param label          name of outcome
     * @param id             id of outcome
     * @param cluster        id of decision point the outcome belongs to
     * @param parent         decision the outcome belongs to
     * @param description    description of the meaning of the outcome
     * @param additionalInfo additional information for an outcome (optional)
     * @param abbrev         abbreviation of outcome
     * @param url
     * @param serviceType
     */
    public Outcome(String label, int id, int cluster, int parent, String description,
                   String additionalInfo, String abbrev, String url, String serviceType) {
        super(id, "out", label);
        this.setDescription(description);
        this.setCluster(cluster);
        this.setGroup("out" + cluster);
        this.setParent(parent);
        this.setAdditionalInfo(additionalInfo);
        this.setAbbrev(abbrev);
        this.url = url;
        this.serviceType = serviceType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

}
