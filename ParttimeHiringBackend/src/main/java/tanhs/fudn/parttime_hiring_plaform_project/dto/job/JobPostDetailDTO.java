package tanhs.fudn.parttime_hiring_plaform_project.dto.job;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostDetailDTO {
    private Integer id;
    private String title;
    private String company;
    private String storeName;
    private String address;
    private String fullAddress;
    private String wage;
    private Integer headcount;
    private String gender;
    private String ageRange;
    private String postedDate;
    private String expiredDate;
    private String description;
    private String requirements;
    private String benefits;
    private String phoneContact;
    
    private List<String> categories;
    private List<String> images;
    private List<String> shifts;
}
