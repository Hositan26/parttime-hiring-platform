package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.RecruitmentInteraction;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.InteractionResponse;

@Mapper(componentModel = "spring")
public interface RecruitmentInteractionMapper {
    // Creates an interaction whose participants are resolved by the service.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "author", source = "author")
    @Mapping(target = "recipient", source = "recipient")
    @Mapping(target = "application", source = "application")
    @Mapping(target = "jobPost", source = "job")
    @Mapping(target = "kind", source = "kind")
    @Mapping(target = "body", source = "request.body")
    @Mapping(target = "meetingAt", source = "request.meetingAt")
    @Mapping(target = "status", constant = "OPEN")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    RecruitmentInteraction create(InteractionRequest request, User author, User recipient,
            JobApplication application, JobPost job, InteractionKind kind);
    // Exposes conversation content without account credentials or private documents.
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "recipientId", source = "recipient.id")
    @Mapping(target = "authorName", source = "author.displayName")
    @Mapping(target = "jobId", source = "jobPost.jobPostId")
    @Mapping(target = "jobTitle", source = "jobPost.title")
    InteractionResponse toResponse(RecruitmentInteraction interaction);
}
